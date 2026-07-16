from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from datetime import datetime, timezone
import uuid

from app.models.enums import OrderStatus, TripStatus, DriverStatus, VehicleStatus
from app.models.order import Order
from app.models.trip import Trip
from app.models.driver import Driver
from app.models.vehicle import Vehicle
from app.models.activity import TripActivityLog

class OrderWorkflowService:
    @staticmethod
    def assign_resources(db: Session, order_id: str, driver_id: str, vehicle_id: str, company_id: str):
        order = db.query(Order).filter(Order.id == order_id, Order.company_id == company_id, Order.is_deleted == False).first()
        if not order:
            raise HTTPException(status_code=404, detail="Order not found")
        
        if order.order_status not in [OrderStatus.PENDING.value, OrderStatus.PLANNING.value]:
            raise HTTPException(status_code=400, detail="Only planning or pending orders can be assigned")

        driver = db.query(Driver).filter(Driver.id == driver_id, Driver.company_id == company_id, Driver.is_deleted == False).first()
        vehicle = db.query(Vehicle).filter(Vehicle.id == vehicle_id, Vehicle.company_id == company_id, Vehicle.is_deleted == False).first()
        
        if not driver or driver.availability_status != DriverStatus.AVAILABLE.value:
            raise HTTPException(status_code=400, detail="Driver is not available")
            
        if not vehicle or vehicle.availability_status != VehicleStatus.AVAILABLE.value:
            raise HTTPException(status_code=400, detail="Vehicle is not available")

        # Create Trip
        trip = Trip(
            id=str(uuid.uuid4()),
            company_id=company_id,
            trip_status=TripStatus.CREATED.value,
            origin=order.pickup_location,
            destination=order.delivery_location
        )
        db.add(trip)
        db.commit()
        
        # Assign order
        order.assigned_driver_id = driver.id
        order.assigned_vehicle_id = vehicle.id
        order.trip_id = trip.id
        order.order_status = OrderStatus.ASSIGNED.value
        order.assigned_at = datetime.now(timezone.utc)
        
        # Lock resources
        driver.availability_status = DriverStatus.ASSIGNED.value
        driver.current_trip_id = trip.id
        vehicle.availability_status = VehicleStatus.ASSIGNED.value
        vehicle.current_trip_id = trip.id
        
        db.commit()
        db.refresh(order)
        return order

class TripWorkflowService:
    @staticmethod
    def log_activity(db: Session, trip_id: str, company_id: str, driver_id: str, action_type: str, notes: str = None):
        log = TripActivityLog(
            id=str(uuid.uuid4()),
            company_id=company_id,
            trip_id=trip_id,
            driver_id=driver_id,
            action_type=action_type,
            notes=notes
        )
        db.add(log)
        db.commit()

    @staticmethod
    def start_trip(db: Session, trip_id: str, company_id: str):
        trip = db.query(Trip).filter(Trip.id == trip_id, Trip.company_id == company_id, Trip.is_deleted == False).first()
        if not trip:
            raise HTTPException(status_code=404, detail="Trip not found")
            
        if trip.trip_status != TripStatus.CREATED.value:
            raise HTTPException(status_code=400, detail="Only created trips can be started")
            
        # Update Trip
        trip.trip_status = TripStatus.STARTED.value
        trip.start_time = datetime.now(timezone.utc)
        
        # Update associated orders
        orders = db.query(Order).filter(Order.trip_id == trip.id).all()
        for order in orders:
            order.order_status = OrderStatus.IN_TRANSIT.value
            
            # Update driver and vehicle statuses securely via the first linked order
            # (Assuming 1 trip = 1 driver/vehicle pair for this MVP logic)
            if order.assigned_driver_id:
                driver = db.query(Driver).get(order.assigned_driver_id)
                if driver:
                    driver.availability_status = DriverStatus.ON_TRIP.value
            if order.assigned_vehicle_id:
                vehicle = db.query(Vehicle).get(order.assigned_vehicle_id)
                if vehicle:
                    vehicle.availability_status = VehicleStatus.ON_TRIP.value
                    
        db.commit()
        db.refresh(trip)
        
        # Log Activity
        driver_id = orders[0].assigned_driver_id if orders else None
        if driver_id:
            TripWorkflowService.log_activity(db, trip.id, company_id, driver_id, "STARTED")
            
        return trip

    @staticmethod
    def complete_trip(db: Session, trip_id: str, company_id: str):
        trip = db.query(Trip).filter(Trip.id == trip_id, Trip.company_id == company_id, Trip.is_deleted == False).first()
        if not trip:
            raise HTTPException(status_code=404, detail="Trip not found")
            
        if trip.trip_status != TripStatus.STARTED.value:
            raise HTTPException(status_code=400, detail="Only started trips can be completed")
            
        trip.trip_status = TripStatus.COMPLETED.value
        trip.end_time = datetime.now(timezone.utc)
        
        orders = db.query(Order).filter(Order.trip_id == trip.id).all()
        for order in orders:
            order.order_status = OrderStatus.DELIVERED.value
            
            # Free up resources
            if order.assigned_driver_id:
                driver = db.query(Driver).get(order.assigned_driver_id)
                if driver:
                    driver.availability_status = DriverStatus.AVAILABLE.value
                    driver.current_trip_id = None
            if order.assigned_vehicle_id:
                vehicle = db.query(Vehicle).get(order.assigned_vehicle_id)
                if vehicle:
                    vehicle.availability_status = VehicleStatus.AVAILABLE.value
                    vehicle.current_trip_id = None
                    
        db.commit()
        db.refresh(trip)
        
        # Log Activity
        driver_id = orders[0].assigned_driver_id if orders else None
        if driver_id:
            TripWorkflowService.log_activity(db, trip.id, company_id, driver_id, "COMPLETED")
            
        return trip
        
    @staticmethod
    def update_progress(db: Session, trip_id: str, company_id: str, location: str, notes: str = None):
        trip = db.query(Trip).filter(Trip.id == trip_id, Trip.company_id == company_id, Trip.is_deleted == False).first()
        if not trip:
            raise HTTPException(status_code=404, detail="Trip not found")
        if trip.trip_status != TripStatus.STARTED.value:
            raise HTTPException(status_code=400, detail="Cannot update progress for an inactive trip")
            
        if location:
            trip.current_location = location
        if notes:
            trip.delivery_notes = notes
            
        db.commit()
        db.refresh(trip)
        return trip
        
    @staticmethod
    def pause_trip(db: Session, trip_id: str, company_id: str):
        trip = db.query(Trip).filter(Trip.id == trip_id, Trip.company_id == company_id, Trip.is_deleted == False).first()
        if not trip:
            raise HTTPException(status_code=404, detail="Trip not found")
        if trip.trip_status != TripStatus.STARTED.value:
            raise HTTPException(status_code=400, detail="Only started trips can be paused")
            
        # Add paused to enum values later if needed, using custom string for now or just "PAUSED"
        trip.trip_status = "PAUSED"
        db.commit()
        db.refresh(trip)
        
        order = db.query(Order).filter(Order.trip_id == trip.id).first()
        if order and order.assigned_driver_id:
            TripWorkflowService.log_activity(db, trip.id, company_id, order.assigned_driver_id, "PAUSED")
            
        return trip
        
    @staticmethod
    def resume_trip(db: Session, trip_id: str, company_id: str):
        trip = db.query(Trip).filter(Trip.id == trip_id, Trip.company_id == company_id, Trip.is_deleted == False).first()
        if not trip:
            raise HTTPException(status_code=404, detail="Trip not found")
        if trip.trip_status != "PAUSED":
            raise HTTPException(status_code=400, detail="Only paused trips can be resumed")
            
        trip.trip_status = TripStatus.STARTED.value
        db.commit()
        db.refresh(trip)
        
        order = db.query(Order).filter(Order.trip_id == trip.id).first()
        if order and order.assigned_driver_id:
            TripWorkflowService.log_activity(db, trip.id, company_id, order.assigned_driver_id, "RESUMED")
            
        return trip
