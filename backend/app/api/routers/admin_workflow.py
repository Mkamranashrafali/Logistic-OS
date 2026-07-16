from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from typing import Any, List
from pydantic import BaseModel

from app.database.session import get_db
from app.models.user import User
from app.models.enums import DriverStatus, VehicleStatus
from app.models.driver import Driver
from app.models.vehicle import Vehicle
from app.api.dependencies.roles import require_roles
from app.core.responses import success_response
from app.services.workflow_service import OrderWorkflowService
from app.schemas.order import OrderResponse

router = APIRouter()

class AssignRequest(BaseModel):
    driver_id: str
    vehicle_id: str

@router.post("/orders/{id}/assign", summary="Assign Driver and Vehicle to Order")
def assign_order(
    id: str,
    payload: AssignRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(["admin"]))
) -> Any:
    order = OrderWorkflowService.assign_resources(
        db=db, 
        order_id=id, 
        driver_id=payload.driver_id, 
        vehicle_id=payload.vehicle_id, 
        company_id=current_user.company_id
    )
    return success_response(message="Order assigned successfully", data=OrderResponse.model_validate(order).model_dump())

@router.get("/orders/availability", summary="Get Available Drivers and Vehicles")
def get_availability(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(["admin"]))
) -> Any:
    drivers = db.query(Driver).filter(
        Driver.company_id == current_user.company_id, 
        Driver.availability_status == DriverStatus.AVAILABLE.value,
        Driver.is_deleted == False
    ).all()
    
    vehicles = db.query(Vehicle).filter(
        Vehicle.company_id == current_user.company_id, 
        Vehicle.availability_status == VehicleStatus.AVAILABLE.value,
        Vehicle.is_deleted == False
    ).all()
    
    return success_response(message="Availability fetched", data={
        "drivers": [{"id": d.id, "name": d.name} for d in drivers],
        "vehicles": [{"id": v.id, "plate": v.plate_number, "make": v.make} for v in vehicles]
    })
