from fastapi import APIRouter, Depends

from app.schemas.booking_schema import (
    BookingCreate,
    BookingStatusUpdate
)

from app.services.booking_service import (
    create_booking,
    get_bookings,
    get_user_bookings,
    update_booking_status
)

from app.middleware.auth_middleware import (
    get_current_user,
    admin_required
)

router = APIRouter(
    prefix="/bookings",
    tags=["Bookings"]
)


@router.post("/")
def book_asset(
    booking: BookingCreate,
    user=Depends(get_current_user)
):
    return create_booking(
        booking,
        user["email"]
    )


@router.get("/")
def all_bookings(user=Depends(admin_required)):
    return get_bookings()


@router.get("/my")
def my_bookings(user=Depends(get_current_user)):
    return get_user_bookings(user["email"])


@router.put("/{booking_id}/status")
def change_booking_status(
    booking_id: str,
    status_update: BookingStatusUpdate,
    user=Depends(admin_required)
):
    return update_booking_status(
        booking_id,
        status_update,
        user["email"]
    )