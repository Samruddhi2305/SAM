from fastapi import APIRouter, Depends
from app.services.audit_service import get_audit_logs
from app.middleware.auth_middleware import admin_required

router = APIRouter(
    prefix="/audit",
    tags=["Audit Trail"]
)

@router.get("/")
def list_audit_logs(user=Depends(admin_required)):
    return get_audit_logs()
