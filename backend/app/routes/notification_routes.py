from fastapi import APIRouter, Depends
from app.services.notification_service import (
    get_user_notifications,
    mark_notification_read,
    mark_all_notifications_read
)
from app.middleware.auth_middleware import get_current_user

router = APIRouter(
    prefix="/notifications",
    tags=["Notifications"]
)

@router.get("/")
def list_notifications(user=Depends(get_current_user)):
    # Admin gets their notifications, users get theirs
    email = "admin" if user["role"] == "admin" else user["email"]
    return get_user_notifications(email)

@router.put("/{notification_id}/read")
def read_notification(
    notification_id: str,
    user=Depends(get_current_user)
):
    email = "admin" if user["role"] == "admin" else user["email"]
    mark_notification_read(notification_id, email)
    return {"message": "Notification marked as read"}

@router.post("/read-all")
def read_all_notifications(user=Depends(get_current_user)):
    email = "admin" if user["role"] == "admin" else user["email"]
    mark_all_notifications_read(email)
    return {"message": "All notifications marked as read"}
