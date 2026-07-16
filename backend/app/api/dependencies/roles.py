from typing import List, Callable
from fastapi import Depends, HTTPException, status
from app.models.user import User
from app.api.dependencies.auth import get_current_user

def require_roles(allowed_roles: List[str]) -> Callable:
    def role_checker(current_user: User = Depends(get_current_user)) -> User:
        if current_user.role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Operation not permitted. Required roles: {', '.join(allowed_roles)}",
            )
        return current_user
    return role_checker
