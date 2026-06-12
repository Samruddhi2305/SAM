from fastapi import Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer

from app.utils.jwt_handler import decode_access_token

oauth2_scheme = OAuth2PasswordBearer(
    tokenUrl="/auth/login"
)


def get_current_user(
    token: str = Depends(oauth2_scheme)
):

    try:
        payload = decode_access_token(token)
        return payload

    except Exception:
        raise HTTPException(
            status_code=401,
            detail="Invalid token"
        )


def admin_required(
    user=Depends(get_current_user)
):

    if user["role"] != "admin":
        raise HTTPException(
            status_code=403,
            detail="Admin access required"
        )

    return user