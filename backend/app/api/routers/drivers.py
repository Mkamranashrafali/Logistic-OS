from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import Any, List

from app.database.session import get_db
from app.models.user import User
from app.api.dependencies.auth import get_current_user
from app.core.responses import success_response
from app.schemas.driver import DriverCreate, DriverUpdate, DriverResponse
from app.services import driver_service
from app.core.security import get_password_hash
import uuid

router = APIRouter()

@router.post("/", response_model=dict, summary="Create Driver")
def create_driver(
    obj_in: DriverCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    if not obj_in.email:
        from fastapi import HTTPException
        raise HTTPException(status_code=400, detail="Driver must have an email address to create a login account.")
    
    from fastapi import HTTPException
    # Check if user with email already exists
    existing_user = db.query(User).filter(User.email == obj_in.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="A user with this email already exists.")

    from app.models.driver import Driver
    existing_driver = db.query(Driver).filter(Driver.email == obj_in.email).first()
    if existing_driver:
        raise HTTPException(status_code=400, detail="A driver with this email already exists.")

    # Create the user first without committing
    new_user = User(
        id=str(uuid.uuid4()),
        company_id=current_user.company_id,
        email=obj_in.email,
        password_hash=get_password_hash("112233"),
        role="driver",
        is_active=True,
        must_change_password=True
    )
    db.add(new_user)
    
    try:
        db.flush()
        
        # Link user_id to driver payload
        obj_in.user_id = new_user.id
        
        # This will commit the transaction including the User
        item = driver_service.create(db, obj_in=obj_in, company_id=current_user.company_id)
        return success_response(message="Driver created successfully", data=DriverResponse.model_validate(item).model_dump())
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=f"Failed to create driver: {str(e)}")

@router.get("/", response_model=dict, summary="Get all drivers")
def read_drivers(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    include_deleted: bool = Query(False),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    items = driver_service.get_multi(db, skip=skip, limit=limit, company_id=current_user.company_id, include_deleted=include_deleted)
    data = [DriverResponse.model_validate(item).model_dump() for item in items]
    return success_response(message="Retrieved drivers successfully", data=data)

@router.get("/{id}", response_model=dict, summary="Get Driver by ID")
def read_driver(
    id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    item = driver_service.get(db, id=id)
    # Ensure item belongs to user's company (Security)
    if hasattr(item, 'company_id') and item.company_id != current_user.company_id:
        from fastapi import HTTPException
        raise HTTPException(status_code=403, detail="Not authorized to access this resource")
    return success_response(message="Driver retrieved successfully", data=DriverResponse.model_validate(item).model_dump())

@router.put("/{id}", response_model=dict, summary="Update Driver")
def update_driver(
    id: str,
    obj_in: DriverUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    item = driver_service.get(db, id=id)
    if hasattr(item, 'company_id') and item.company_id != current_user.company_id:
        from fastapi import HTTPException
        raise HTTPException(status_code=403, detail="Not authorized to access this resource")
        
    item = driver_service.update(db, id=id, obj_in=obj_in)
    return success_response(message="Driver updated successfully", data=DriverResponse.model_validate(item).model_dump())

@router.delete("/{id}", response_model=dict, summary="Soft delete Driver")
def delete_driver(
    id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    item = driver_service.get(db, id=id)
    if hasattr(item, 'company_id') and item.company_id != current_user.company_id:
        from fastapi import HTTPException
        raise HTTPException(status_code=403, detail="Not authorized to access this resource")
        
    driver_service.remove(db, id=id)
    
    # Also soft-delete the associated User account so they can't login
    if hasattr(item, 'user_id') and item.user_id:
        user = db.query(User).filter(User.id == item.user_id).first()
        if user:
            user.is_active = False
            if hasattr(user, 'is_deleted'):
                user.is_deleted = True
            db.add(user)
            db.commit()
            
    return success_response(message="Driver deleted successfully")
