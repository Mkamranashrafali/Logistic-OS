from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import Any, List

from app.database.session import get_db
from app.models.user import User
from app.api.dependencies.auth import get_current_user
from app.core.responses import success_response
from app.schemas.trip import TripCreate, TripUpdate, TripResponse
from app.services import trip_service

router = APIRouter()

@router.post("/", response_model=dict, summary="Create Trip")
def create_trip(
    obj_in: TripCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    # Automatically enforce multi-tenancy via current_user.company_id
    item = trip_service.create(db, obj_in=obj_in, company_id=current_user.company_id)
    return success_response(message="Trip created successfully", data=TripResponse.model_validate(item).model_dump())

@router.get("/", response_model=dict, summary="Get all trips")
def read_trips(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    items = trip_service.get_multi(db, skip=skip, limit=limit, company_id=current_user.company_id)
    data = [TripResponse.model_validate(item).model_dump() for item in items]
    return success_response(message="Retrieved trips successfully", data=data)

@router.get("/{id}", response_model=dict, summary="Get Trip by ID")
def read_trip(
    id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    item = trip_service.get(db, id=id)
    # Ensure item belongs to user's company (Security)
    if hasattr(item, 'company_id') and item.company_id != current_user.company_id:
        from fastapi import HTTPException
        raise HTTPException(status_code=403, detail="Not authorized to access this resource")
    return success_response(message="Trip retrieved successfully", data=TripResponse.model_validate(item).model_dump())

@router.put("/{id}", response_model=dict, summary="Update Trip")
def update_trip(
    id: str,
    obj_in: TripUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    item = trip_service.get(db, id=id)
    if hasattr(item, 'company_id') and item.company_id != current_user.company_id:
        from fastapi import HTTPException
        raise HTTPException(status_code=403, detail="Not authorized to access this resource")
        
    item = trip_service.update(db, id=id, obj_in=obj_in)
    return success_response(message="Trip updated successfully", data=TripResponse.model_validate(item).model_dump())

@router.delete("/{id}", response_model=dict, summary="Soft delete Trip")
def delete_trip(
    id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    item = trip_service.get(db, id=id)
    if hasattr(item, 'company_id') and item.company_id != current_user.company_id:
        from fastapi import HTTPException
        raise HTTPException(status_code=403, detail="Not authorized to access this resource")
        
    trip_service.remove(db, id=id)
    return success_response(message="Trip deleted successfully")
