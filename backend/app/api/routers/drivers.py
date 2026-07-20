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

    import secrets
    import hashlib
    from datetime import datetime, timezone, timedelta
    from app.services.email import email_service
    from app.models.company import Company
    
    # Create the user first without committing
    raw_token = secrets.token_urlsafe(32)
    token_hash = hashlib.sha256(raw_token.encode()).hexdigest()
    
    new_user = User(
        id=str(uuid.uuid4()),
        company_id=current_user.company_id,
        email=obj_in.email,
        password_hash="!unusable_hash", # No default password
        role="driver",
        is_active=True,
        must_change_password=False,
        reset_password_token=token_hash,
        reset_password_token_expires=datetime.now(timezone.utc) + timedelta(hours=24)
    )
    db.add(new_user)
    
    try:
        db.flush()
        
        # Link user_id to driver payload
        obj_in.user_id = new_user.id
        
        # This will commit the transaction including the User
        item = driver_service.create(db, obj_in=obj_in, company_id=current_user.company_id)
        
        # Fetch company name for email
        company = db.query(Company).filter(Company.id == current_user.company_id).first()
        company_name = company.name if company else "Our Company"
        
        email_service.send_driver_invitation_email(
            to_email=obj_in.email, 
            token=raw_token, 
            company_name=company_name, 
            driver_name=obj_in.name
        )
        
        return success_response(message="Driver created successfully and invitation sent", data=DriverResponse.model_validate(item).model_dump())
    except Exception as e:
        db.rollback()
        error_msg = str(e).lower()
        if "unique constraint" in error_msg or "duplicate key" in error_msg:
            if "email" in error_msg:
                detail = "A driver with this email already exists."
            elif "license_number" in error_msg:
                detail = "A driver with this license number already exists."
            elif "phone" in error_msg:
                detail = "A driver with this phone number already exists."
            else:
                detail = "A driver with these unique details already exists."
            raise HTTPException(status_code=400, detail=detail)
            
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

@router.post("/{id}/resend-invitation", summary="Resend Driver Invitation")
def resend_driver_invitation(
    id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    from app.models.driver import Driver
    from app.models.enums import DriverLifecycleStatus
    from fastapi import HTTPException
    import secrets
    import hashlib
    from datetime import datetime, timezone, timedelta
    from app.services.email import email_service
    from app.models.company import Company
    
    driver = db.query(Driver).filter(Driver.id == id, Driver.is_deleted == False).first()
    if not driver or driver.company_id != current_user.company_id:
        raise HTTPException(status_code=404, detail="Driver not found")
        
    if driver.lifecycle_status != DriverLifecycleStatus.PENDING.value:
        raise HTTPException(status_code=400, detail="Can only resend invitation for pending drivers")
        
    user = db.query(User).filter(User.id == driver.user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Driver user account not found")
        
    now = datetime.now(timezone.utc)
    
    # Rate Limiting
    if user.last_reset_password_email_sent_at:
        time_since_last = (now - user.last_reset_password_email_sent_at).total_seconds()
        if time_since_last < 60:
            raise HTTPException(status_code=429, detail="Please wait 60 seconds before resending.")
        if time_since_last >= 3600:
            user.reset_password_email_send_count = 0
            
    if user.reset_password_email_send_count >= 5:
        raise HTTPException(status_code=429, detail="Maximum 5 invitations per hour. Please try later.")
        
    raw_token = secrets.token_urlsafe(32)
    token_hash = hashlib.sha256(raw_token.encode()).hexdigest()
    
    user.reset_password_token = token_hash
    user.reset_password_token_expires = now + timedelta(hours=24)
    user.last_reset_password_email_sent_at = now
    user.reset_password_email_send_count += 1
    db.commit()
    
    company = db.query(Company).filter(Company.id == current_user.company_id).first()
    
    try:
        email_service.send_driver_invitation_email(
            to_email=driver.email,
            token=raw_token,
            company_name=company.name if company else "Our Company",
            driver_name=driver.name
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to send invitation email")
        
    return success_response(message="Invitation sent successfully")

@router.post("/{id}/suspend", summary="Suspend Driver")
def suspend_driver(
    id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    from app.models.driver import Driver
    from app.models.enums import DriverLifecycleStatus
    from fastapi import HTTPException
    
    driver = db.query(Driver).filter(Driver.id == id, Driver.is_deleted == False).first()
    if not driver or driver.company_id != current_user.company_id:
        raise HTTPException(status_code=404, detail="Driver not found")
        
    if driver.lifecycle_status == DriverLifecycleStatus.TERMINATED.value:
        raise HTTPException(status_code=400, detail="Cannot suspend a terminated driver")
        
    driver.lifecycle_status = DriverLifecycleStatus.SUSPENDED.value
    
    user = db.query(User).filter(User.id == driver.user_id).first()
    if user:
        user.is_active = False # Block login
        
    db.commit()
    return success_response(message="Driver suspended successfully")

@router.post("/{id}/activate", summary="Activate Driver")
def activate_driver(
    id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    from app.models.driver import Driver
    from app.models.enums import DriverLifecycleStatus
    from fastapi import HTTPException
    
    driver = db.query(Driver).filter(Driver.id == id, Driver.is_deleted == False).first()
    if not driver or driver.company_id != current_user.company_id:
        raise HTTPException(status_code=404, detail="Driver not found")
        
    if driver.lifecycle_status == DriverLifecycleStatus.TERMINATED.value:
        raise HTTPException(status_code=400, detail="Cannot activate a terminated driver")
        
    driver.lifecycle_status = DriverLifecycleStatus.ACTIVE.value
    
    user = db.query(User).filter(User.id == driver.user_id).first()
    if user:
        user.is_active = True # Restore login
        user.is_verified = True # Assuming activated means they are good to go, though they reset password
        
    db.commit()
    return success_response(message="Driver activated successfully")

@router.post("/{id}/terminate", summary="Terminate Driver")
def terminate_driver(
    id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    from app.models.driver import Driver
    from app.models.enums import DriverLifecycleStatus
    from app.models.company import Company
    from app.services.email import email_service
    from fastapi import HTTPException
    from datetime import datetime, timezone
    
    driver = db.query(Driver).filter(Driver.id == id, Driver.is_deleted == False).first()
    if not driver or driver.company_id != current_user.company_id:
        raise HTTPException(status_code=404, detail="Driver not found")
        
    if driver.lifecycle_status == DriverLifecycleStatus.TERMINATED.value:
        return success_response(message="Driver is already terminated")
        
    driver.lifecycle_status = DriverLifecycleStatus.TERMINATED.value
    driver.terminated_at = datetime.now(timezone.utc)
    driver.terminated_by = current_user.id
    
    user = db.query(User).filter(User.id == driver.user_id).first()
    if user:
        user.is_active = False # Block login
        
    company = db.query(Company).filter(Company.id == current_user.company_id).first()
    
    db.commit()
    
    try:
        email_service.send_termination_email(
            to_email=driver.email,
            company_name=company.name if company else "Our Company",
            driver_name=driver.name
        )
    except Exception as e:
        pass # Don't block termination on email failure
        
    return success_response(message="Driver terminated successfully")
