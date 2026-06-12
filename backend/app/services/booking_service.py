from fastapi import HTTPException
from bson import ObjectId
from datetime import datetime
from app.database import bookings_collection, assets_collection, use_fallback
from app.services.audit_service import log_action
from app.services.notification_service import create_notification

def _get_query_id(id_str: str):
    if use_fallback:
        return id_str
    try:
        return ObjectId(id_str)
    except Exception:
        return id_str

def check_availability(asset_id: str, quantity: int, start_date: datetime, end_date: datetime):
    asset = assets_collection.find_one(
        {"_id": _get_query_id(asset_id)}
    )
    if not asset:
        raise HTTPException(
            status_code=404,
            detail="Asset not found"
        )
    
    if asset.get("status") in ["Maintenance", "Damaged"]:
        return 0, asset.get("name", "Unknown Asset")
    
    total_qty = asset.get("quantity", 0)
    
    # Query overlapping approved/issued bookings
    overlapping_qty = 0
    all_bookings = bookings_collection.find({"asset_id": asset_id})
    for b in all_bookings:
        if b.get("status") not in ["approved", "issued"]:
            continue
        
        b_start = b.get("start_date")
        b_end = b.get("end_date")
        if isinstance(b_start, str):
            b_start = datetime.fromisoformat(b_start)
        if isinstance(b_end, str):
            b_end = datetime.fromisoformat(b_end)

        # Overlap check
        if start_date < b_end and end_date > b_start:
            overlapping_qty += b.get("quantity", 0)

    available_qty = total_qty - overlapping_qty
    return available_qty, asset.get("name", "Unknown Asset")

def create_booking(booking, user_email: str):
    start_date = booking.start_date
    end_date = booking.end_date

    if start_date >= end_date:
        raise HTTPException(
            status_code=400,
            detail="Start date must be before end date"
        )

    available_qty, asset_name = check_availability(
        booking.asset_id,
        booking.quantity,
        start_date,
        end_date
    )

    if available_qty < booking.quantity:
        raise HTTPException(
            status_code=400,
            detail=f"Insufficient inventory. Only {available_qty} available for this duration."
        )

    booking_data = {
        "asset_id": booking.asset_id,
        "asset_name": asset_name,
        "user_email": user_email,
        "quantity": booking.quantity,
        "start_date": start_date.isoformat(),
        "end_date": end_date.isoformat(),
        "status": "pending",
        "notes": None
    }

    result = bookings_collection.insert_one(booking_data)
    booking_id = str(result.inserted_id)

    # Log to audit trail
    log_action(
        action="REQUEST_BOOKING",
        user_email=user_email,
        details={
            "booking_id": booking_id,
            "asset_id": booking.asset_id,
            "asset_name": asset_name,
            "quantity": booking.quantity
        }
    )

    # Notify admin
    create_notification(
        user_email="admin", # system-wide admin channel or just admin users
        message=f"New booking request from {user_email} for {booking.quantity}x {asset_name}",
        type="info"
    )

    return {
        "message": "Booking request submitted successfully",
        "id": booking_id
    }

def get_bookings():
    bookings = []
    for booking in bookings_collection.find():
        booking["_id"] = str(booking["_id"])
        # Ensure dates are parsed properly for formatting
        bookings.append(booking)
    return bookings

def get_user_bookings(user_email: str):
    bookings = []
    for booking in bookings_collection.find({"user_email": user_email}):
        booking["_id"] = str(booking["_id"])
        bookings.append(booking)
    return bookings

def update_booking_status(booking_id: str, status_update, admin_email: str):
    booking = bookings_collection.find_one(
        {"_id": _get_query_id(booking_id)}
    )
    if not booking:
        raise HTTPException(
            status_code=404,
            detail="Booking request not found"
        )

    old_status = booking.get("status")
    new_status = status_update.status
    notes = status_update.notes

    # State validation
    valid_transitions = {
        "pending": ["approved", "rejected"],
        "approved": ["issued", "rejected"],
        "issued": ["returned"]
    }

    if new_status not in valid_transitions.get(old_status, []):
        raise HTTPException(
            status_code=400,
            detail=f"Invalid status transition from {old_status} to {new_status}"
        )

    if new_status == "approved":
        b_start = booking.get("start_date")
        b_end = booking.get("end_date")
        if isinstance(b_start, str):
            b_start = datetime.fromisoformat(b_start)
        if isinstance(b_end, str):
            b_end = datetime.fromisoformat(b_end)
            
        available_qty, asset_name = check_availability(
            booking["asset_id"],
            booking["quantity"],
            b_start,
            b_end
        )
        if available_qty < booking["quantity"]:
            raise HTTPException(
                status_code=400,
                detail=f"Insufficient inventory. Only {available_qty} units of '{asset_name}' are available for this duration."
            )

    update_fields = {
        "status": new_status,
        "notes": notes
    }

    if new_status == "issued":
        update_fields["issued_at"] = datetime.utcnow().isoformat()
    elif new_status == "returned":
        update_fields["returned_at"] = datetime.utcnow().isoformat()

    bookings_collection.update_one(
        {"_id": _get_query_id(booking_id)},
        {"$set": update_fields}
    )

    # Log action
    log_action(
        action=f"UPDATE_BOOKING_{new_status.upper()}",
        user_email=admin_email,
        details={
            "booking_id": booking_id,
            "asset_id": booking["asset_id"],
            "asset_name": booking["asset_name"],
            "user_email": booking["user_email"],
            "quantity": booking["quantity"]
        }
    )

    # Notify user
    create_notification(
        user_email=booking["user_email"],
        message=f"Your booking request for {booking['quantity']}x {booking['asset_name']} has been {new_status}.",
        type="success" if new_status in ["approved", "returned"] else "warning"
    )

    return {"message": f"Booking status updated to {new_status}"}