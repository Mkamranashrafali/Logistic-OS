from fastapi import APIRouter, Depends, HTTPException, status, Response
from sqlalchemy.orm import Session
from datetime import timedelta, datetime, timezone
from typing import Any

from app.database.session import get_db
from app.models.user import User
from app.models.company import Company
from app.schemas.user import UserLogin, UserResponse, Token, ChangePasswordRequest, CompanySignupRequest, ResendVerificationRequest, ForgotPasswordRequest, ResetPasswordRequest
from app.core.security import verify_password, create_access_token, get_password_hash
from app.core.config import settings
from app.api.dependencies.auth import get_current_user
from app.core.responses import success_response
from app.services.email import email_service
import re
import secrets
import hashlib

router = APIRouter()

def slugify(text: str) -> str:
    text = text.lower()
    return re.sub(r'[\W_]+', '-', text).strip('-')

@router.post("/signup", summary="Company Owner Signup")
def signup(payload: CompanySignupRequest, response: Response, db: Session = Depends(get_db)) -> Any:
    if payload.password != payload.confirm_password:
        raise HTTPException(status_code=400, detail="Passwords do not match")
        
    if len(payload.password) < 8:
        raise HTTPException(status_code=400, detail="Password must be at least 8 characters long")
        
    existing_user = db.query(User).filter(User.email == payload.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
        
    # Create Company
    base_slug = slugify(payload.company_name)
    slug = base_slug
    counter = 1
    while db.query(Company).filter(Company.slug == slug).first():
        slug = f"{base_slug}-{counter}"
        counter += 1
        
    company = Company(
        name=payload.company_name,
        slug=slug,
        is_active=True
    )
    db.add(company)
    db.flush()
    
    raw_token = secrets.token_urlsafe(32)
    token_hash = hashlib.sha256(raw_token.encode()).hexdigest()
    
    # Create Owner User
    user = User(
        email=payload.email,
        password_hash=get_password_hash(payload.password),
        role="owner",
        company_id=company.id,
        is_active=True,
        must_change_password=False,
        is_verified=False,
        verification_token=token_hash,
        verification_token_expires=datetime.now(timezone.utc) + timedelta(hours=24)
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    
    # Send verification email
    try:
        success = email_service.send_verification_email(user.email, raw_token)
        if not success:
            db.rollback()
            raise HTTPException(status_code=500, detail="Failed to send verification email due to an external service error.")
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    
    return success_response(
        message="Account created successfully. Please verify your email.", 
        data={"user_id": user.id}
    )

@router.post("/login", summary="Login user")
def login(user_data: UserLogin, response: Response, db: Session = Depends(get_db)) -> Any:
    print(f"DEBUG INCOMING: email={user_data.email}, remember_me={user_data.remember_me}")
    user = db.query(User).filter(User.email == user_data.email).first()
    
    if user_data.remember_me:
        access_token_expires = timedelta(days=7)
    else:
        access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    max_age_seconds = int(access_token_expires.total_seconds())
    print(f"DEBUG CALCULATED: remember_me={user_data.remember_me}, expires={access_token_expires}, max_age={max_age_seconds}")
    
    if not user or not verify_password(user_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
        )
    if not user.is_verified:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Please verify your email before logging in."
        )
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Inactive user"
        )
    
    if user_data.remember_me:
        access_token_expires = timedelta(days=7)
    else:
        access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        
    access_token = create_access_token(
        subject=user.id, expires_delta=access_token_expires
    )
    
    max_age_seconds = int(access_token_expires.total_seconds())
    expires_datetime = datetime.now(timezone.utc) + access_token_expires
    
    response.set_cookie(
        key="access_token",
        value=access_token,
        httponly=True,
        samesite="lax",
        secure=False,
        max_age=max_age_seconds,
        expires=expires_datetime
    )
    
    return success_response(
        message="Login successful", 
        data={"user": UserResponse.model_validate(user).model_dump()}
    )

from google.oauth2 import id_token
from google.auth.transport import requests as google_requests
from app.schemas.user import GoogleLoginRequest

@router.post("/google", summary="Google OAuth Login")
def google_login(payload: GoogleLoginRequest, response: Response, db: Session = Depends(get_db)) -> Any:
    try:
        request_session = google_requests.Request()
        idinfo = id_token.verify_oauth2_token(
            payload.credential, 
            request_session, 
            settings.GOOGLE_CLIENT_ID
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail="Invalid Google token")

    if not idinfo.get("email_verified"):
        raise HTTPException(status_code=400, detail="Google email is not verified")

    email = idinfo["email"]
    google_id = idinfo["sub"]
    name = idinfo.get("name", "")

    user = db.query(User).filter(User.email == email).first()

    if user:
        if user.role == "driver":
            raise HTTPException(
                status_code=403, 
                detail="This Google account belongs to a driver account. Please sign in using your assigned email and password."
            )
        
        # Existing Owner
        if user.provider == "local":
            user.provider = "google"
        if not user.google_id:
            user.google_id = google_id
        if not user.is_verified:
            user.is_verified = True
        db.commit()
    else:
        # New Owner
        base_slug = slugify(name or email.split('@')[0])
        slug = base_slug
        counter = 1
        while db.query(Company).filter(Company.slug == slug).first():
            slug = f"{base_slug}-{counter}"
            counter += 1
            
        company = Company(
            name=f"{name}'s Company" if name else "My Company",
            slug=slug,
            is_active=True
        )
        db.add(company)
        db.flush()
        
        user = User(
            email=email,
            password_hash=None,
            provider="google",
            google_id=google_id,
            role="owner",
            company_id=company.id,
            is_active=True,
            must_change_password=False,
            is_verified=True,
        )
        db.add(user)
        db.commit()
        db.refresh(user)

    # Generate JWT
    access_token_expires = timedelta(days=7)
    access_token = create_access_token(
        subject=user.id, expires_delta=access_token_expires
    )
    
    max_age_seconds = int(access_token_expires.total_seconds())
    expires_datetime = datetime.now(timezone.utc) + access_token_expires
    
    response.set_cookie(
        key="access_token",
        value=access_token,
        httponly=True,
        samesite="lax",
        secure=False,
        max_age=max_age_seconds,
        expires=expires_datetime
    )
    
    return success_response(
        message="Login successful", 
        data={"user": UserResponse.model_validate(user).model_dump()}
    )

@router.get("/verify-email", summary="Verify user email")
def verify_email(token: str, db: Session = Depends(get_db)) -> Any:
    token_hash = hashlib.sha256(token.encode()).hexdigest()
    user = db.query(User).filter(User.verification_token == token_hash).first()
    
    if not user:
        raise HTTPException(status_code=400, detail="Invalid verification token")
        
    if user.verification_token_expires and user.verification_token_expires < datetime.now(timezone.utc):
        raise HTTPException(status_code=400, detail="Verification token has expired")
        
    user.is_verified = True
    user.verification_token = None
    user.verification_token_expires = None
    db.commit()
    
    return success_response(message="Email successfully verified")

@router.post("/resend-verification", summary="Resend verification email")
def resend_verification(payload: ResendVerificationRequest, db: Session = Depends(get_db)) -> Any:
    user = db.query(User).filter(User.email == payload.email).first()
    
    # Do not leak whether the email exists or not
    if not user:
        return success_response(message="A new verification email has been sent.")
        
    if user.is_verified:
        return success_response(message="Your email is already verified.")
        
    now = datetime.now(timezone.utc)
    
    # Rate Limiting
    if user.last_verification_email_sent_at:
        time_since_last_email = (now - user.last_verification_email_sent_at).total_seconds()
        
        # 1 email per 60 seconds
        if time_since_last_email < 60:
            raise HTTPException(status_code=429, detail="Please wait 60 seconds before requesting another email.")
            
        # Reset count if last email was more than 1 hour ago
        if time_since_last_email >= 3600:
            user.verification_email_send_count = 0
            
    if user.verification_email_send_count >= 5:
        raise HTTPException(status_code=429, detail="You have reached the maximum number of resend requests for this hour. Please try again later.")
        
    raw_token = secrets.token_urlsafe(32)
    token_hash = hashlib.sha256(raw_token.encode()).hexdigest()
    
    user.verification_token = token_hash
    user.verification_token_expires = now + timedelta(hours=24)
    user.last_verification_email_sent_at = now
    user.verification_email_send_count += 1
    db.commit()
    
    try:
        success = email_service.send_verification_email(user.email, raw_token)
        if not success:
            db.rollback()
            raise HTTPException(status_code=500, detail="Failed to send verification email due to an external service error.")
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    
    return success_response(message="A new verification email has been sent.")

@router.post("/forgot-password", summary="Request a password reset")
def forgot_password(payload: ForgotPasswordRequest, db: Session = Depends(get_db)) -> Any:
    user = db.query(User).filter(User.email == payload.email).first()
    
    msg = "If an account exists, a password reset email has been sent."
    if not user:
        return success_response(message=msg)
        
    now = datetime.now(timezone.utc)
    
    # Rate Limiting
    if user.last_reset_password_email_sent_at:
        time_since_last_email = (now - user.last_reset_password_email_sent_at).total_seconds()
        
        # 1 email per 60 seconds
        if time_since_last_email < 60:
            raise HTTPException(status_code=429, detail="Please wait 60 seconds before requesting another email.")
            
        # Reset count if last email was more than 1 hour ago
        if time_since_last_email >= 3600:
            user.reset_password_email_send_count = 0
            
    if user.reset_password_email_send_count >= 5:
        raise HTTPException(status_code=429, detail="You have reached the maximum number of reset requests for this hour. Please try again later.")
        
    raw_token = secrets.token_urlsafe(32)
    token_hash = hashlib.sha256(raw_token.encode()).hexdigest()
    
    user.reset_password_token = token_hash
    user.reset_password_token_expires = now + timedelta(minutes=30)
    user.last_reset_password_email_sent_at = now
    user.reset_password_email_send_count += 1
    db.commit()
    
    try:
        success = email_service.send_password_reset_email(user.email, raw_token)
        if not success:
            db.rollback()
            raise HTTPException(status_code=500, detail="Failed to send reset email due to an external service error.")
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))
        
    return success_response(message=msg)

@router.post("/reset-password", summary="Reset password using token")
def reset_password(payload: ResetPasswordRequest, db: Session = Depends(get_db)) -> Any:
    if len(payload.password) < 8:
        raise HTTPException(status_code=400, detail="Password must be at least 8 characters long")
        
    token_hash = hashlib.sha256(payload.token.encode()).hexdigest()
    user = db.query(User).filter(User.reset_password_token == token_hash).first()
    
    if not user:
        raise HTTPException(status_code=400, detail="Invalid reset token")
        
    now = datetime.now(timezone.utc)
    if user.reset_password_token_expires and user.reset_password_token_expires < now:
        raise HTTPException(status_code=400, detail="Reset token has expired")
        
    user.password_hash = get_password_hash(payload.password)
    user.reset_password_token = None
    user.reset_password_token_expires = None
    
    if user.role == "driver":
        from app.models.driver import Driver
        from app.models.enums import DriverLifecycleStatus
        driver = db.query(Driver).filter(Driver.user_id == user.id).first()
        if driver and driver.lifecycle_status == DriverLifecycleStatus.PENDING.value:
            driver.lifecycle_status = DriverLifecycleStatus.ACTIVE.value
            
    db.commit()
    
    return success_response(message="Password has been successfully reset.")

@router.post("/logout", summary="Logout user")
def logout(response: Response, current_user: User = Depends(get_current_user)) -> Any:
    response.delete_cookie("access_token")
    return success_response(message="Successfully logged out")

@router.post("/change-password", summary="Change password on first login")
def change_password(
    payload: ChangePasswordRequest, 
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user)
) -> Any:
    current_user.password_hash = get_password_hash(payload.new_password)
    current_user.must_change_password = False
    db.commit()
    db.refresh(current_user)
    return success_response(message="Password updated successfully")

@router.get("/me", summary="Get current authenticated user")
def get_me(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)) -> Any:
    name = current_user.email.split('@')[0].replace('.', ' ').title()
    
    if current_user.role == "driver":
        from app.models.driver import Driver
        driver = db.query(Driver).filter(Driver.user_id == current_user.id).first()
        if driver and driver.name:
            name = driver.name

    user_data = UserResponse.model_validate(current_user).model_dump()
    user_data["name"] = name

    return success_response(
        message="User profile retrieved successfully",
        data={"user": user_data}
    )
