from fastapi import APIRouter
from typing import Any
from app.core.responses import success_response
from app.core.config import settings

router = APIRouter()

@router.get("/health", summary="Health check endpoint")
def health_check() -> Any:
    return success_response(
        message="API is running smoothly", 
        data={"project": settings.PROJECT_NAME, "version": settings.VERSION, "status": "ok"}
    )
