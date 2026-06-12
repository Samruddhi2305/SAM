from datetime import datetime
from app.database import audit_logs_collection

def log_action(action: str, user_email: str, details: dict):
    log_entry = {
        "action": action,
        "user_email": user_email,
        "details": details,
        "timestamp": datetime.utcnow().isoformat()
    }
    try:
        audit_logs_collection.insert_one(log_entry)
    except Exception as e:
        print(f"Failed to log audit action: {e}")

def get_audit_logs():
    logs = []
    for log in audit_logs_collection.find():
        log["_id"] = str(log["_id"])
        logs.append(log)
    # Sort by timestamp descending
    logs.sort(key=lambda x: x.get("timestamp", ""), reverse=True)
    return logs
