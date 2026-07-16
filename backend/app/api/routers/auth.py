from fastapi import APIRouter, Depends, HTTPException, status, Response
from sqlalchemy.orm import Session
from datetime import timedelta
from typing import Any

from app.database.session import get_db
from app.models.user import User
from app.schemas.user import UserLogin, UserResponse, Token, ChangePasswordRequest
from app.core.security import verify_password, create_access_token, get_password_hash
from app.core.config import settings
from app.api.dependencies.auth import get_current_user
from app.core.responses import success_response

router = APIRouter()

@router.post("/login", summary="Login user")
def login(user_data: UserLogin, response: Response, db: Session = Depends(get_db)) -> Any:
    user = db.query(User).filter(User.email == user_data.email).first()
    if not user or not verify_password(user_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
        )
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Inactive user"
        )
    
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        subject=user.id, expires_delta=access_token_expires
    )
    
    response.set_cookie(
        key="access_token",
        value=access_token,
        httponly=True,
        samesite="lax",
        secure=False,
        max_age=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60
    )
    
    return success_response(
        message="Login successful", 
        data={"user": UserResponse.model_validate(user).model_dump()}
    )

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
