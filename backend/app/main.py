from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routes.auth_routes import router as auth_router
from app.routes.asset_routes import router as asset_router
from app.routes.booking_routes import router as booking_router
from app.routes.dashboard_routes import router as dashboard_router
from app.routes.notification_routes import router as notification_router
from app.routes.audit_routes import router as audit_router

app = FastAPI(
    title="Smart Asset Management Platform"
)

# Configure CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://10.69.211.186:5173"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(asset_router)
app.include_router(booking_router)
app.include_router(dashboard_router)
app.include_router(notification_router)
app.include_router(audit_router)


@app.get("/")
def root():
    return {
        "message": "Asset Management API Running"
    }