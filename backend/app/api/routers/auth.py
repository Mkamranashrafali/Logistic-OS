from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import timedelta
from typing import Any

from app.database.session import get_db
from app.models.user import User
from app.schemas.user import UserLogin, UserResponse, Token
from app.core.security import verify_password, create_access_token
from app.core.config import settings
from app.api.dependencies.auth import get_current_user
from app.core.responses import success_response

router = APIRouter()

@router.post("/login", summary="Login user")
def login(user_data: UserLogin, db: Session = Depends(get_db)) -> Any:
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
    
    return success_response(
        message="Login successful", 
        data={"access_token": access_token, "token_type": "bearer", "user": UserResponse.model_validate(user).model_dump()}
    )

@router.post("/logout", summary="Logout user")
def logout(current_user: User = Depends(get_current_user)) -> Any:
    # In a stateless JWT system, logout is mostly handled client-side by deleting the token.
    # To implement server-side invalidation, a token blacklist or Redis would be needed.
    return success_response(message="Successfully logged out")

@router.get("/me", summary="Get current authenticated user")
def get_me(current_user: User = Depends(get_current_user)) -> Any:
    return success_response(
        message="User profile retrieved successfully",
        data=UserResponse.model_validate(current_user).model_dump()
    )
