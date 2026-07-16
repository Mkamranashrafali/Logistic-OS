from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import Any

from app.database.session import get_db
from app.models.user import User
from app.api.dependencies.auth import get_current_user
from app.core.responses import success_response
from app.models.order import Order
from app.models.trip import Trip
from app.models.driver import Driver
from app.models.vehicle import Vehicle
from app.models.enums import TripStatus, DriverStatus, OrderStatus

from app.services.analytics import analytics_service

router = APIRouter()

@router.get("/stats", summary="Get Dashboard Statistics")
def get_dashboard_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    company_id = current_user.company_id
    
    kpis = analytics_service.get_dashboard_kpis(db, company_id)
    
    recent_orders = db.query(Order).filter(
        Order.company_id == company_id, 
        Order.is_deleted == False
    ).order_by(Order.created_at.desc()).limit(5).all()
    
    recent_activities = [
        {
            "id": o.id,
            "title": f"Order {o.id[:8]} status updated to {o.order_status}",
            "time": o.updated_at.isoformat() if o.updated_at else None
        }
        for o in recent_orders
    ]

    return success_response(message="Stats fetched", data={
        **kpis,
        "recentActivities": recent_activities
    })
