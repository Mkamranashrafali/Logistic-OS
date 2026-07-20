from fastapi import APIRouter, Depends, HTTPException, status, Response
from sqlalchemy.orm import Session
from datetime import timedelta, datetime, timezone
from typing import Any

from app.database.session import get_db
from app.models.user import User
from app.models.company import Company
from app.schemas.user import UserLogin, UserResponse, Token, ChangePasswordRequest, CompanySignupRequest, ResendVerificationRequest
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
    if not user or user.is_verified:
        return success_response(message="If the email exists and is not verified, a new link has been sent.")
        
    raw_token = secrets.token_urlsafe(32)
    token_hash = hashlib.sha256(raw_token.encode()).hexdigest()
    
    user.verification_token = token_hash
    user.verification_token_expires = datetime.now(timezone.utc) + timedelta(hours=24)
    db.commit()
    
    try:
        success = email_service.send_verification_email(user.email, raw_token)
        if not success:
            raise HTTPException(status_code=500, detail="Failed to send verification email due to an external service error.")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
    return success_response(message="If the email exists and is not verified, a new link has been sent.")

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
def get_me(current_user: User = Depends(get_current_user)) -> Any:
    return success_response(
        message="User profile retrieved successfully",
        data=UserResponse.model_validate(current_user).model_dump()
    )
