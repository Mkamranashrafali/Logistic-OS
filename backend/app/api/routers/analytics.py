from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import Any, Optional
from datetime import datetime

from app.database.session import get_db
from app.models.user import User
from app.api.dependencies.auth import get_current_user
from app.core.responses import success_response
from app.services.analytics import analytics_service

router = APIRouter()

@router.get("/dashboard", response_model=dict, summary="Get Dashboard KPIs")
def get_kpis(
    start_date: Optional[datetime] = Query(None),
    end_date: Optional[datetime] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    data = analytics_service.get_dashboard_kpis(db, current_user.company_id, start_date, end_date)
    return success_response(message="Dashboard KPIs retrieved successfully", data=data)

@router.get("/revenue", response_model=dict, summary="Get Revenue Trend")
def get_revenue_trend(
    start_date: Optional[datetime] = Query(None),
    end_date: Optional[datetime] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    data = analytics_service.get_revenue_trend(db, current_user.company_id, start_date, end_date)
    return success_response(message="Revenue trend retrieved successfully", data=data)

@router.get("/drivers", response_model=dict, summary="Get Driver Performance")
def get_driver_performance(
    start_date: Optional[datetime] = Query(None),
    end_date: Optional[datetime] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    data = analytics_service.get_driver_performance(db, current_user.company_id, start_date, end_date)
    return success_response(message="Driver performance retrieved successfully", data=data)

@router.get("/finance", response_model=dict, summary="Get Financial Analytics")
def get_financial_analytics(
    start_date: Optional[datetime] = Query(None),
    end_date: Optional[datetime] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    data = analytics_service.get_financial_analytics(db, current_user.company_id, start_date, end_date)
    return success_response(message="Financial analytics retrieved successfully", data=data)

@router.get("/trips", response_model=dict, summary="Get Trip Analytics")
def get_trip_analytics(
    start_date: Optional[datetime] = Query(None),
    end_date: Optional[datetime] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    data = analytics_service.get_trip_analytics(db, current_user.company_id, start_date, end_date)
    return success_response(message="Trip analytics retrieved successfully", data=data)

@router.get("/fuel", response_model=dict, summary="Get Fuel Analytics")
def get_fuel_analytics(
    start_date: Optional[datetime] = Query(None),
    end_date: Optional[datetime] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    data = analytics_service.get_fuel_analytics(db, current_user.company_id, start_date, end_date)
    return success_response(message="Fuel analytics retrieved successfully", data=data)

@router.get("/vehicles", response_model=dict, summary="Get Vehicle Analytics")
def get_vehicle_analytics(
    start_date: Optional[datetime] = Query(None),
    end_date: Optional[datetime] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    data = analytics_service.get_vehicle_analytics(db, current_user.company_id, start_date, end_date)
    return success_response(message="Vehicle analytics retrieved successfully", data=data)

@router.get("/customers", response_model=dict, summary="Get Customer Analytics")
def get_customer_analytics(
    start_date: Optional[datetime] = Query(None),
    end_date: Optional[datetime] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    data = analytics_service.get_customer_analytics(db, current_user.company_id, start_date, end_date)
    return success_response(message="Customer analytics retrieved successfully", data=data)
