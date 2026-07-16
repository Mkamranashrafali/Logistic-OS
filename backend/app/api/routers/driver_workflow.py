from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from typing import Any
from pydantic import BaseModel

from app.database.session import get_db
from app.models.user import User
from app.models.driver import Driver
from app.models.trip import Trip
from app.api.dependencies.roles import require_roles
from app.core.responses import success_response
from app.services.workflow_service import TripWorkflowService
from app.schemas.trip import TripResponse

router = APIRouter()

class UpdateProgressRequest(BaseModel):
    location: str = None
    notes: str = None

def get_current_driver(db: Session, current_user: User) -> Driver:
    driver = db.query(Driver).filter(Driver.user_id == current_user.id, Driver.is_deleted == False).first()
    if not driver:
        raise HTTPException(status_code=403, detail="Your user account is not linked to a driver profile")
    return driver

@router.get("/trips", summary="Get driver's trips")
def get_driver_trips(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(["driver"]))
) -> Any:
    driver = get_current_driver(db, current_user)
    trips = db.query(Trip).filter(Trip.id == driver.current_trip_id).all() if driver.current_trip_id else []
    return success_response(message="Trips fetched", data=[TripResponse.model_validate(t).model_dump() for t in trips])

@router.post("/trips/{id}/start", summary="Start a trip")
def start_trip(
    id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(["driver"]))
) -> Any:
    driver = get_current_driver(db, current_user)
    if driver.current_trip_id != id:
        raise HTTPException(status_code=403, detail="You can only start your currently assigned trip")
        
    trip = TripWorkflowService.start_trip(db=db, trip_id=id, company_id=current_user.company_id)
    return success_response(message="Trip started successfully", data=TripResponse.model_validate(trip).model_dump())

@router.post("/trips/{id}/complete", summary="Complete a trip")
def complete_trip(
    id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(["driver"]))
) -> Any:
    driver = get_current_driver(db, current_user)
    if driver.current_trip_id != id:
        raise HTTPException(status_code=403, detail="You can only complete your currently assigned trip")
        
    trip = TripWorkflowService.complete_trip(db=db, trip_id=id, company_id=current_user.company_id)
    return success_response(message="Trip completed successfully", data=TripResponse.model_validate(trip).model_dump())

@router.patch("/trips/{id}/status", summary="Update trip progress")
def update_trip_status(
    id: str,
    payload: UpdateProgressRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(["driver"]))
) -> Any:
    driver = get_current_driver(db, current_user)
    if driver.current_trip_id != id:
        raise HTTPException(status_code=403, detail="You can only update your currently assigned trip")
        
    trip = TripWorkflowService.update_progress(
        db=db, 
        trip_id=id, 
        company_id=current_user.company_id, 
        location=payload.location, 
        notes=payload.notes
    )
    return success_response(message="Trip progress updated", data=TripResponse.model_validate(trip).model_dump())
