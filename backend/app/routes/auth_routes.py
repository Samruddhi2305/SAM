from fastapi import APIRouter, Depends

from app.schemas.user_schema import (
    UserRegister,
    UserLogin,
    UserOut,
    OTPVerify
)

from app.services.auth_service import (
    register_user,
    login_user,
    verify_otp_user
)

from app.middleware.auth_middleware import (
    get_current_user
)

router = APIRouter(
    prefix="/auth",
    tags=["Authentication"]
)


@router.post("/register")
def register(user: UserRegister):
    return register_user(user)


@router.post("/login")
def login(user: UserLogin):
    return login_user(user)


@router.post("/verify-otp")
def verify_otp(verify_data: OTPVerify):
    return verify_otp_user(verify_data)


@router.get("/me")
def get_me(user=Depends(get_current_user)):
    return {
        "id": user.get("email"),
        "name": user.get("name", "User"),
        "email": user.get("email"),
        "role": user.get("role")
    }