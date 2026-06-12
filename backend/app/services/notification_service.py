from datetime import datetime
from bson import ObjectId
from app.database import notifications_collection, use_fallback

def _get_query_id(id_str: str):
    if use_fallback:
        return id_str
    try:
        return ObjectId(id_str)
    except Exception:
        return id_str

def create_notification(user_email: str, message: str, type: str = "info"):
    notification = {
        "user_email": user_email,
        "message": message,
        "type": type,
        "is_read": False,
        "timestamp": datetime.utcnow().isoformat()
    }
    try:
        notifications_collection.insert_one(notification)
    except Exception as e:
        print(f"Failed to create notification: {e}")

def get_user_notifications(user_email: str):
    notes = []
    for note in notifications_collection.find({"user_email": user_email}):
        note["_id"] = str(note["_id"])
        notes.append(note)
    notes.sort(key=lambda x: x.get("timestamp", ""), reverse=True)
    return notes

def mark_notification_read(notification_id: str, user_email: str):
    notifications_collection.update_one(
        {"_id": _get_query_id(notification_id), "user_email": user_email},
        {"$set": {"is_read": True}}
    )

def mark_all_notifications_read(user_email: str):
    # In JSON fallback, update_one matches only first. Pymongo's update_many is better,
    # but we can implement multi-update or just run update_one in a loop, or support update_many.
    # Let's check what update methods JSONCollection supports. It only has update_one.
    # To keep it simple and clean, let's update all unread notifications.
    if use_fallback:
        data = notifications_collection._read()
        for doc in data:
            if doc.get("user_email") == user_email and not doc.get("is_read"):
                doc["is_read"] = True
        notifications_collection._write(data)
    else:
        notifications_collection.update_many(
            {"user_email": user_email, "is_read": False},
            {"$set": {"is_read": True}}
        )
