from fastapi import HTTPException
from bson import ObjectId
from datetime import datetime
from app.database import assets_collection, use_fallback
from app.services.audit_service import log_action

def _get_query_id(id_str: str):
    if use_fallback:
        return id_str
    try:
        return ObjectId(id_str)
    except Exception:
        return id_str

def create_asset(asset, user_email: str):
    asset_data = asset.dict()
    asset_data["maintenance_history"] = []
    
    # default fields if missing
    if "status" not in asset_data or not asset_data["status"]:
        asset_data["status"] = "Available"
    if "condition" not in asset_data or not asset_data["condition"]:
        asset_data["condition"] = "Good"

    result = assets_collection.insert_one(asset_data)
    asset_id = str(result.inserted_id)

    # Log to audit trail
    log_action(
        action="CREATE_ASSET",
        user_email=user_email,
        details={
            "asset_id": asset_id,
            "name": asset.name,
            "category": asset.category,
            "quantity": asset.quantity
        }
    )

    return {
        "message": "Asset added successfully",
        "id": asset_id
    }

def get_assets():
    assets = []
    for asset in assets_collection.find():
        asset["_id"] = str(asset["_id"])
        # ensure default values exist
        if "condition" not in asset:
            asset["condition"] = "Good"
        if "maintenance_history" not in asset:
            asset["maintenance_history"] = []
        assets.append(asset)
    return assets

def get_asset(asset_id: str):
    asset = assets_collection.find_one(
        {"_id": _get_query_id(asset_id)}
    )
    if not asset:
        raise HTTPException(
            status_code=404,
            detail="Asset not found"
        )
    asset["_id"] = str(asset["_id"])
    if "condition" not in asset:
        asset["condition"] = "Good"
    if "maintenance_history" not in asset:
        asset["maintenance_history"] = []
    return asset

def update_asset(asset_id: str, asset_update, user_email: str):
    update_data = {
        k: v for k, v in asset_update.dict().items()
        if v is not None
    }
    
    if not update_data:
        raise HTTPException(
            status_code=400,
            detail="No fields to update"
        )

    # Fetch existing asset
    existing = get_asset(asset_id)

    result = assets_collection.update_one(
        {"_id": _get_query_id(asset_id)},
        {"$set": update_data}
    )

    if result.matched_count == 0:
        raise HTTPException(
            status_code=404,
            detail="Asset not found"
        )

    log_action(
        action="UPDATE_ASSET",
        user_email=user_email,
        details={
            "asset_id": asset_id,
            "name": existing["name"],
            "changes": update_data
        }
    )

    return {"message": "Asset updated successfully"}

def delete_asset(asset_id: str, user_email: str):
    existing = get_asset(asset_id)
    
    result = assets_collection.delete_one(
        {"_id": _get_query_id(asset_id)}
    )

    if result.deleted_count == 0:
        raise HTTPException(
            status_code=404,
            detail="Asset not found"
        )

    log_action(
        action="DELETE_ASSET",
        user_email=user_email,
        details={
            "asset_id": asset_id,
            "name": existing["name"]
        }
    )

    return {"message": "Asset deleted successfully"}

def log_maintenance(asset_id: str, maintenance, user_email: str):
    asset = get_asset(asset_id)
    
    history = asset.get("maintenance_history", [])
    log_entry = {
        "date": datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S"),
        "action": maintenance.action,
        "cost": maintenance.cost,
        "performed_by": maintenance.performed_by
    }
    history.append(log_entry)

    # Set status to "Maintenance" when logged if relevant, or keep as is
    assets_collection.update_one(
        {"_id": _get_query_id(asset_id)},
        {"$set": {
            "maintenance_history": history,
            "status": "Maintenance"
        }}
    )

    log_action(
        action="ASSET_MAINTENANCE",
        user_email=user_email,
        details={
            "asset_id": asset_id,
            "name": asset["name"],
            "action": maintenance.action,
            "cost": maintenance.cost
        }
    )

    return {"message": "Maintenance log added successfully"}