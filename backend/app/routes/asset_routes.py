from fastapi import APIRouter, Depends

from app.schemas.asset_schema import (
    AssetCreate,
    AssetUpdate,
    AssetMaintenance
)

from app.services.asset_service import (
    create_asset,
    get_assets,
    get_asset,
    update_asset,
    delete_asset,
    log_maintenance
)

from app.middleware.auth_middleware import (
    admin_required,
    get_current_user
)

router = APIRouter(
    prefix="/assets",
    tags=["Assets"]
)


@router.post("/")
def add_asset(
    asset: AssetCreate,
    user=Depends(admin_required)
):
    return create_asset(asset, user["email"])


@router.get("/")
def list_assets():
    return get_assets()


@router.get("/{asset_id}")
def view_asset(asset_id: str):
    return get_asset(asset_id)


@router.put("/{asset_id}")
def edit_asset(
    asset_id: str,
    asset: AssetUpdate,
    user=Depends(admin_required)
):
    return update_asset(asset_id, asset, user["email"])


@router.delete("/{asset_id}")
def remove_asset(
    asset_id: str,
    user=Depends(admin_required)
):
    return delete_asset(asset_id, user["email"])


@router.post("/{asset_id}/maintenance")
def add_maintenance(
    asset_id: str,
    maintenance: AssetMaintenance,
    user=Depends(admin_required)
):
    return log_maintenance(asset_id, maintenance, user["email"])