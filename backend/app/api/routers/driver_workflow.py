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
from app.schemas.trip import TripResponse, DriverTripResponse
from app.models.activity import TripActivityLog
from pydantic import BaseModel
from datetime import datetime, timezone
import uuid
from app.models.company import Company
from app.models.vehicle import Vehicle

router = APIRouter()

class UpdateProgressRequest(BaseModel):
    location: str = None
    notes: str = None

class ExpenseEntryRequest(BaseModel):
    trip_id: str = None
    category: str
    amount: float = 0.0
    notes: str = None
    receipt_url: str = None

class ProfileUpdateRequest(BaseModel):
    name: str = None
    phone: str = None
    profile_pic_url: str = None
    emergency_contact: str = None

def get_current_driver(db: Session, current_user: User) -> Driver:
    driver = db.query(Driver).filter(Driver.user_id == current_user.id, Driver.is_deleted == False).first()
    if not driver:
        raise HTTPException(status_code=403, detail="Your user account is not linked to a driver profile")
    return driver

@router.get("/profile", summary="Get driver profile")
def get_profile(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(["driver"]))
) -> Any:
    driver = get_current_driver(db, current_user)
    company = db.query(Company).filter(Company.id == driver.company_id).first()
    
    # Try to find assigned vehicle via current trip
    assigned_vehicle = None
    if driver.current_trip_id:
        assigned_vehicle = db.query(Vehicle).filter(Vehicle.current_trip_id == driver.current_trip_id).first()
        
    vehicle_data = None
    if assigned_vehicle:
        vehicle_name = f"{assigned_vehicle.make or ''} {assigned_vehicle.model or ''}".strip() or "Assigned Vehicle"
        vehicle_data = {
            "id": assigned_vehicle.id,
            "name": vehicle_name,
            "license_plate": assigned_vehicle.plate_number,
            "make": assigned_vehicle.make,
            "model": assigned_vehicle.model,
            "plate_number": assigned_vehicle.plate_number
        }

    return success_response(message="Profile fetched", data={
        "id": driver.id,
        "name": driver.name,
        "email": driver.email,
        "phone": driver.phone,
        "license_number": driver.license_number,
        "profile_pic_url": driver.profile_pic_url,
        "availability_status": driver.availability_status,
        "company": {"id": company.id, "name": company.name} if company else None,
        "assigned_vehicle": vehicle_data
    })

@router.get("/expenses", summary="Get driver expenses")
def get_driver_expenses(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(["driver"]))
) -> Any:
    driver = get_current_driver(db, current_user)
    
    data = []
    
    # General Expenses
    # We must find the driver's trips to find their expenses
    from app.models.expense import Expense
    from app.models.order import Order
    trips = db.query(Trip.id).join(Order, Order.trip_id == Trip.id).filter(Order.assigned_driver_id == driver.id).all()
    trip_ids = [t[0] for t in trips]
    
    if trip_ids:
        expenses = db.query(Expense).filter(Expense.trip_id.in_(trip_ids), Expense.is_deleted == False).all()
        data.extend([{
            "id": e.id,
            "type": e.category,
            "amount": e.amount,
            "date": e.date.isoformat(),
            "station": None,
            "notes": e.description,
            "receipt_url": e.receipt_url
        } for e in expenses])
        
    # Sort descending by date
    data.sort(key=lambda x: x["date"], reverse=True)
    
    return success_response(message="Expenses fetched", data=data)

@router.post("/expenses", summary="Log generic expense")
def add_driver_expense(
    payload: ExpenseEntryRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(["driver"]))
) -> Any:
    driver = get_current_driver(db, current_user)
    trip_id = payload.trip_id or driver.current_trip_id
    if not trip_id:
        raise HTTPException(status_code=400, detail="An active trip is required to log an expense.")
        
    from app.models.expense import Expense
    expense = Expense(
        id=str(uuid.uuid4()),
        trip_id=trip_id,
        company_id=current_user.company_id,
        amount=payload.amount,
        category=payload.category,
        description=payload.notes,
        date=datetime.now(timezone.utc),
        receipt_url=payload.receipt_url
    )
    db.add(expense)
    TripWorkflowService.log_activity(db, trip_id, current_user.company_id, driver.id, "EXPENSE_ADDED", notes=f"{payload.category} expense of ${payload.amount}")
    
    db.commit()
    db.refresh(expense)

    from app.services.financial_service import TripFinancialService
    TripFinancialService.recalculate_trip_financials(db, trip_id)

    return success_response(message="Expense logged successfully")


@router.get("/trips", summary="Get driver's trips")
def get_driver_trips(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(["driver"]))
) -> Any:
    driver = get_current_driver(db, current_user)
    
    from app.models.order import Order
    # Find all trips that have an order assigned to this driver
    trips = db.query(Trip).join(Order, Order.trip_id == Trip.id).filter(
        Order.assigned_driver_id == driver.id,
        Order.is_deleted == False,
        Trip.is_deleted == False
    ).distinct().order_by(Trip.created_at.desc()).all()
    
    return success_response(message="Trips fetched", data=[DriverTripResponse.model_validate(t).model_dump() for t in trips])

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
    return success_response(message="Trip started successfully", data=DriverTripResponse.model_validate(trip).model_dump())

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
    return success_response(message="Trip completed successfully", data=DriverTripResponse.model_validate(trip).model_dump())

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
    return success_response(message="Trip progress updated", data=DriverTripResponse.model_validate(trip).model_dump())

@router.post("/trips/{id}/pause", summary="Pause a trip")
def pause_trip(
    id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(["driver"]))
) -> Any:
    driver = get_current_driver(db, current_user)
    if driver.current_trip_id != id:
        raise HTTPException(status_code=403, detail="You can only pause your currently assigned trip")
    trip = TripWorkflowService.pause_trip(db=db, trip_id=id, company_id=current_user.company_id)
    return success_response(message="Trip paused successfully", data=DriverTripResponse.model_validate(trip).model_dump())

@router.post("/trips/{id}/resume", summary="Resume a paused trip")
def resume_trip(
    id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(["driver"]))
) -> Any:
    driver = get_current_driver(db, current_user)
    if driver.current_trip_id != id:
        raise HTTPException(status_code=403, detail="You can only resume your currently assigned trip")
    trip = TripWorkflowService.resume_trip(db=db, trip_id=id, company_id=current_user.company_id)
    return success_response(message="Trip resumed successfully", data=DriverTripResponse.model_validate(trip).model_dump())



@router.get("/activities", summary="Get recent activities")
def get_activities(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(["driver"]))
) -> Any:
    driver = get_current_driver(db, current_user)
    activities = db.query(TripActivityLog).filter(
        TripActivityLog.driver_id == driver.id
    ).order_by(TripActivityLog.timestamp.desc()).limit(20).all()
    
    # Serialize manually for simplicity since we don't have a schema
    data = [{
        "id": a.id,
        "trip_id": a.trip_id,
        "action_type": a.action_type,
        "notes": a.notes,
        "timestamp": a.timestamp.isoformat()
    } for a in activities]
    
    return success_response(message="Activities fetched", data=data)

@router.get("/activity", summary="Get recent activities (alias)")
def get_activity_alias(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(["driver"]))
) -> Any:
    return get_activities(db=db, current_user=current_user)

@router.put("/profile", summary="Update Driver Profile")
def update_profile(
    payload: ProfileUpdateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(["driver"]))
) -> Any:
    driver = get_current_driver(db, current_user)
    if payload.name:
        driver.name = payload.name
    if payload.phone:
        driver.phone = payload.phone
    if payload.profile_pic_url is not None:
        driver.profile_pic_url = payload.profile_pic_url
        
    db.commit()
    db.refresh(driver)
    return success_response(
        message="Profile updated successfully", 
        data={
            "id": driver.id,
            "name": driver.name,
            "phone": driver.phone,
            "profile_pic_url": driver.profile_pic_url
        }
    )
