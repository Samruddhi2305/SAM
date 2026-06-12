from fastapi import HTTPException
from app.database import users_collection
from app.utils.password_hash import hash_password, verify_password
from app.utils.jwt_handler import create_access_token

def register_user(user):
    existing_user = users_collection.find_one(
        {"email": user.email}
    )
    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="Email already exists"
        )

    # First user is admin, others are standard users
    is_first = users_collection.count_documents({}) == 0
    role = "admin" if is_first else "user"

    user_data = {
        "name": user.name,
        "email": user.email,
        "password": hash_password(user.password),
        "role": role
    }

    users_collection.insert_one(user_data)
    return {
        "message": "User registered successfully",
        "role": role
    }

import random
from datetime import datetime, timedelta

def login_user(login_data):
    user = users_collection.find_one(
        {"email": login_data.email}
    )
    if not user:
        raise HTTPException(
            status_code=401,
            detail="Invalid credentials"
        )

    if not verify_password(
        login_data.password,
        user["password"]
    ):
        raise HTTPException(
            status_code=401,
            detail="Invalid credentials"
        )

    # Generate a random 6-digit OTP
    otp = str(random.randint(100000, 999999))
    
    # Store temporary OTP in database with 5-minute expiry
    users_collection.update_one(
        {"email": user["email"]},
        {"$set": {
            "temp_otp": otp,
            "otp_expiry": (datetime.utcnow() + timedelta(minutes=5)).isoformat()
        }}
    )

    # Print OTP to backend console terminal logs
    print(f"\n==========================================")
    print(f"[SECURITY] SIMULATED OTP FOR {user['email']}: {otp}")
    print(f"==========================================\n")

    return {
        "status": "otp_required",
        "email": user["email"]
    }

def verify_otp_user(verify_data):
    user = users_collection.find_one(
        {"email": verify_data.email}
    )
    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    stored_otp = user.get("temp_otp")
    otp_expiry = user.get("otp_expiry")

    if not stored_otp or stored_otp != verify_data.otp:
        raise HTTPException(
            status_code=400,
            detail="Invalid OTP code"
        )

    if otp_expiry:
        try:
            expiry_dt = datetime.fromisoformat(otp_expiry)
            if datetime.utcnow() > expiry_dt:
                raise HTTPException(
                    status_code=400,
                    detail="OTP has expired"
                )
        except Exception:
            pass

    # Clear OTP after verification
    users_collection.update_one(
        {"email": user["email"]},
        {"$unset": {"temp_otp": "", "otp_expiry": ""}}
    )

    token = create_access_token(
        {
            "email": user["email"],
            "role": user["role"],
            "name": user["name"]
        }
    )

    return {
        "access_token": token,
        "token_type": "bearer",
        "role": user["role"],
        "name": user["name"],
        "email": user["email"]
    }