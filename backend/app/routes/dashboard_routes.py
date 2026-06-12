from datetime import datetime
from fastapi import APIRouter, Depends

from app.database import (
    assets_collection,
    bookings_collection,
    users_collection
)
from app.middleware.auth_middleware import admin_required

router = APIRouter(
    prefix="/dashboard",
    tags=["Dashboard"]
)


@router.get("/stats")
def dashboard_stats(user=Depends(admin_required)):
    # 1. Total records
    total_assets = assets_collection.count_documents({})
    total_users = users_collection.count_documents({})
    total_bookings = bookings_collection.count_documents({})

    all_assets = list(assets_collection.find())
    all_bookings = list(bookings_collection.find())

    # 2. Inventory status
    total_qty = sum(a.get("quantity", 0) for a in all_assets)
    available_assets = sum(a.get("quantity", 0) for a in all_assets if a.get("status") == "Available")
    maintenance_assets = sum(a.get("quantity", 0) for a in all_assets if a.get("status") == "Maintenance")
    damaged_assets = sum(a.get("quantity", 0) for a in all_assets if a.get("status") == "Damaged")

    # 3. Bookings status
    active_bookings = sum(1 for b in all_bookings if b.get("status") in ["approved", "issued"])
    pending_bookings = sum(1 for b in all_bookings if b.get("status") == "pending")
    returned_bookings = sum(1 for b in all_bookings if b.get("status") == "returned")

    # 4. Overdue check
    now_str = datetime.utcnow().isoformat()
    overdue_bookings = 0
    for b in all_bookings:
        if b.get("status") == "issued":
            end_date = b.get("end_date")
            if end_date and end_date < now_str:
                overdue_bookings += 1

    # 5. Category distribution
    categories = {}
    for a in all_assets:
        cat = a.get("category", "Uncategorized")
        categories[cat] = categories.get(cat, 0) + a.get("quantity", 0)
    category_data = [{"name": k, "value": v} for k, v in categories.items()]

    # 6. Top 5 assets usage
    asset_usage = {}
    for b in all_bookings:
        name = b.get("asset_name", "Unknown")
        asset_usage[name] = asset_usage.get(name, 0) + 1
    sorted_usage = sorted(asset_usage.items(), key=lambda x: x[1], reverse=True)[:5]
    utilization_data = [{"name": k, "bookings": v} for k, v in sorted_usage]

    # 7. Trends
    trends = {}
    for b in all_bookings:
        start_date = b.get("start_date")
        if start_date:
            day = start_date[:10]
            trends[day] = trends.get(day, 0) + 1
    sorted_trends = sorted(trends.items())[-7:]
    trend_data = [{"date": k, "bookings": v} for k, v in sorted_trends]

    return {
        "summary": {
            "total_assets": total_assets,
            "total_users": total_users,
            "total_bookings": total_bookings,
            "total_quantity": total_qty,
            "available_assets": available_assets,
            "maintenance_assets": maintenance_assets,
            "damaged_assets": damaged_assets,
            "active_bookings": active_bookings,
            "pending_bookings": pending_bookings,
            "returned_bookings": returned_bookings,
            "overdue_bookings": overdue_bookings
        },
        "category_distribution": category_data,
        "asset_utilization": utilization_data,
        "booking_trends": trend_data
    }