from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from typing import Any
from pydantic import BaseModel

from app.database.session import get_db
from app.models.user import User
from app.api.dependencies.auth import get_current_user
from app.core.responses import success_response
from app.services.planning import planning_service
from app.schemas.order import OrderResponse
from app.services.workflow_service import OrderWorkflowService

router = APIRouter()

class AssignRequest(BaseModel):
    driver_id: str
    vehicle_id: str

@router.get("/orders", summary="Get Planning Orders")
def get_planning_orders(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    orders = planning_service.get_planning_orders(db, current_user.company_id, skip=skip, limit=limit)
    data = [OrderResponse.model_validate(o).model_dump() for o in orders]
    return success_response(message="Planning orders fetched successfully", data=data)

@router.get("/availability/{order_id}", summary="Get Availability for Order")
def get_availability(
    order_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    # Availability is global per company
    data = planning_service.get_availability(db, current_user.company_id)
    return success_response(message="Availability fetched successfully", data=data)

@router.get("/recommendations/{order_id}", summary="Get Recommendations for Order")
def get_recommendations(
    order_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    data = planning_service.get_recommendations(db, current_user.company_id, order_id)
    return success_response(message="Recommendations fetched successfully", data=data)

@router.post("/assign/{order_id}", summary="Assign Order from Planning")
def assign_order(
    order_id: str,
    payload: AssignRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    order = OrderWorkflowService.assign_resources(
        db=db,
        order_id=order_id,
        driver_id=payload.driver_id,
        vehicle_id=payload.vehicle_id,
        company_id=current_user.company_id
    )
    return success_response(message="Order assigned successfully", data=OrderResponse.model_validate(order).model_dump())
