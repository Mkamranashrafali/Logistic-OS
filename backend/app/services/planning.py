from sqlalchemy.orm import Session
from sqlalchemy import or_
from typing import List, Dict, Any, Optional
from datetime import datetime

from app.models.order import Order
from app.models.enums import OrderStatus, DriverStatus, VehicleStatus, TripStatus, DriverLifecycleStatus
from app.models.driver import Driver
from app.models.vehicle import Vehicle
from app.models.trip import Trip

class PlanningService:
    @staticmethod
    def get_planning_orders(db: Session, company_id: str, skip: int = 0, limit: int = 100) -> List[Order]:
        return db.query(Order).filter(
            Order.company_id == company_id,
            Order.order_status.in_([OrderStatus.PLANNING.value, OrderStatus.PENDING.value]),
            Order.is_deleted == False
        ).order_by(Order.created_at.asc()).offset(skip).limit(limit).all()

    @staticmethod
    def _get_next_available_date(db: Session, resource_type: str, resource_id: str) -> Optional[datetime]:
        # Deprecated: Kept for backwards compatibility if used elsewhere.
        query = db.query(Order).join(Trip, Order.trip_id == Trip.id).filter(
            Trip.trip_status == TripStatus.STARTED.value,
            Trip.is_deleted == False,
            Order.is_deleted == False
        )
        if resource_type == 'driver':
            query = query.filter(Order.assigned_driver_id == resource_id)
        else:
            query = query.filter(Order.assigned_vehicle_id == resource_id)
            
        order = query.first()
        if order and order.expected_delivery_date:
            return order.expected_delivery_date
        return None

    @staticmethod
    def get_availability(db: Session, company_id: str) -> Dict[str, Any]:
        all_drivers = db.query(Driver).filter(
            Driver.company_id == company_id,
            Driver.is_deleted == False,
            Driver.lifecycle_status == DriverLifecycleStatus.ACTIVE.value
        ).all()
        
        all_vehicles = db.query(Vehicle).filter(
            Vehicle.company_id == company_id,
            Vehicle.is_deleted == False
        ).all()

        # Bulk fetch active orders to prevent N+1 query problem
        active_orders = db.query(
            Order.assigned_driver_id,
            Order.assigned_vehicle_id,
            Order.expected_delivery_date
        ).join(Trip, Order.trip_id == Trip.id).filter(
            Trip.company_id == company_id,
            Trip.trip_status == TripStatus.STARTED.value,
            Trip.is_deleted == False,
            Order.is_deleted == False
        ).all()

        driver_dates = {}
        vehicle_dates = {}
        for o in active_orders:
            if o.assigned_driver_id and o.expected_delivery_date:
                driver_dates[o.assigned_driver_id] = o.expected_delivery_date
            if o.assigned_vehicle_id and o.expected_delivery_date:
                vehicle_dates[o.assigned_vehicle_id] = o.expected_delivery_date

        drivers_data = []
        for d in all_drivers:
            next_date = None
            if d.availability_status != DriverStatus.AVAILABLE.value:
                next_date = driver_dates.get(d.id)
            drivers_data.append({
                "id": d.id,
                "name": d.name,
                "status": d.availability_status,
                "next_available_date": next_date.isoformat() if next_date else None
            })

        vehicles_data = []
        for v in all_vehicles:
            next_date = None
            if v.availability_status != VehicleStatus.AVAILABLE.value:
                next_date = vehicle_dates.get(v.id)
            vehicles_data.append({
                "id": v.id,
                "plate_number": v.plate_number,
                "make": v.make,
                "status": v.availability_status,
                "next_available_date": next_date.isoformat() if next_date else None
            })

        return {
            "drivers": drivers_data,
            "vehicles": vehicles_data
        }

    @staticmethod
    def get_recommendations(db: Session, company_id: str, order_id: str) -> Dict[str, Any]:
        availability = PlanningService.get_availability(db, company_id)
        
        recommended_driver = next((d for d in availability["drivers"] if d["status"] == DriverStatus.AVAILABLE.value), None)
        if not recommended_driver:
            sorted_drivers = sorted(
                [d for d in availability["drivers"] if d["next_available_date"]],
                key=lambda x: x["next_available_date"]
            )
            recommended_driver = sorted_drivers[0] if sorted_drivers else None

        recommended_vehicle = next((v for v in availability["vehicles"] if v["status"] == VehicleStatus.AVAILABLE.value), None)
        if not recommended_vehicle:
            sorted_vehicles = sorted(
                [v for v in availability["vehicles"] if v["next_available_date"]],
                key=lambda x: x["next_available_date"]
            )
            recommended_vehicle = sorted_vehicles[0] if sorted_vehicles else None

        return {
            "recommended_driver": recommended_driver,
            "recommended_vehicle": recommended_vehicle
        }

planning_service = PlanningService()
