from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import Any, List

from app.database.session import get_db
from app.models.user import User
from app.api.dependencies.auth import get_current_user
from app.core.responses import success_response
from app.schemas.order import OrderCreate, OrderUpdate, OrderResponse
from app.services import order_service

router = APIRouter()

@router.post("", response_model=dict, summary="Create Order")
def create_order(
    obj_in: OrderCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    # Automatically enforce multi-tenancy via current_user.company_id
    item = order_service.create(db, obj_in=obj_in, company_id=current_user.company_id)
    return success_response(message="Order created successfully", data=OrderResponse.model_validate(item).model_dump())

@router.get("", response_model=dict, summary="Get all orders")
def read_orders(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    items = order_service.get_multi(db, skip=skip, limit=limit, company_id=current_user.company_id)
    data = [OrderResponse.model_validate(item).model_dump() for item in items]
    return success_response(message="Retrieved orders successfully", data=data)

@router.get("/{id}", response_model=dict, summary="Get Order by ID")
def read_order(
    id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    item = order_service.get(db, id=id)
    # Ensure item belongs to user's company (Security)
    if hasattr(item, 'company_id') and item.company_id != current_user.company_id:
        from fastapi import HTTPException
        raise HTTPException(status_code=403, detail="Not authorized to access this resource")
    return success_response(message="Order retrieved successfully", data=OrderResponse.model_validate(item).model_dump())

@router.put("/{id}", response_model=dict, summary="Update Order")
def update_order(
    id: str,
    obj_in: OrderUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    item = order_service.get(db, id=id)
    if hasattr(item, 'company_id') and item.company_id != current_user.company_id:
        from fastapi import HTTPException
        raise HTTPException(status_code=403, detail="Not authorized to access this resource")
        
    item = order_service.update(db, id=id, obj_in=obj_in)
    
    if getattr(item, 'trip_id', None):
        from app.services.financial_service import TripFinancialService
        TripFinancialService.recalculate_trip_financials(db, item.trip_id)

    return success_response(message="Order updated successfully", data=OrderResponse.model_validate(item).model_dump())

@router.delete("/{id}", response_model=dict, summary="Soft delete Order")
def delete_order(
    id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    item = order_service.get(db, id=id)
    if hasattr(item, 'company_id') and item.company_id != current_user.company_id:
        from fastapi import HTTPException
        raise HTTPException(status_code=403, detail="Not authorized to access this resource")
        
    driver_id = item.assigned_driver_id
    vehicle_id = item.assigned_vehicle_id
    trip_id = item.trip_id

    order_service.remove(db, id=id)
    
    # Auto-delete associated trip
    if trip_id:
        from app.services import trip_service
        try:
            trip_service.remove(db, id=trip_id)
        except Exception:
            pass
            
    # Free resources
    if driver_id:
        from app.models.driver import Driver
        driver = db.query(Driver).filter(Driver.id == driver_id).first()
        if driver:
            driver.availability_status = "available"
            if driver.current_trip_id == trip_id:
                driver.current_trip_id = None
                
    if vehicle_id:
        from app.models.vehicle import Vehicle
        vehicle = db.query(Vehicle).filter(Vehicle.id == vehicle_id).first()
        if vehicle:
            vehicle.availability_status = "available"
            
    db.commit()
    
    return success_response(message="Order deleted successfully")
