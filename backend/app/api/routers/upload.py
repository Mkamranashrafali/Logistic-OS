import os
import uuid
import shutil
from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from app.models.user import User
from app.api.dependencies.auth import get_current_user
from app.core.responses import success_response

router = APIRouter()

UPLOAD_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "..", "uploads"))
MAX_FILE_SIZE = 5 * 1024 * 1024  # 5 MB

@router.post("", summary="Upload file")
async def upload_file(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user)
):
    allowed_extensions = {".jpg", ".jpeg", ".png", ".gif", ".webp", ".svg"}
    ext = os.path.splitext(file.filename or "")[1].lower()
    if not ext or ext not in allowed_extensions:
        raise HTTPException(
            status_code=400, 
            detail="Invalid file format. Allowed formats: JPG, JPEG, PNG, GIF, WEBP, SVG"
        )

    # Read content to validate file size
    contents = await file.read()
    if len(contents) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=400,
            detail="File size exceeds maximum limit of 5MB."
        )

    os.makedirs(UPLOAD_DIR, exist_ok=True)
    filename = f"{uuid.uuid4()}{ext}"
    file_path = os.path.join(UPLOAD_DIR, filename)

    try:
        with open(file_path, "wb") as buffer:
            buffer.write(contents)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save file: {str(e)}")

    url = f"/uploads/{filename}"
    return success_response(message="File uploaded successfully", data={"url": url})
