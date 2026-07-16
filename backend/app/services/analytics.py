from sqlalchemy.orm import Session
from sqlalchemy import func, case, extract, desc
from datetime import datetime, timedelta, timezone
from typing import Optional, Dict, Any, List

from app.models.order import Order
from app.models.trip import Trip
from app.models.expense import Expense
from app.models.fuel import FuelEntry
from app.models.driver import Driver
from app.models.vehicle import Vehicle
from app.models.customer import Customer
from app.models.enums import OrderStatus, TripStatus

class AnalyticsService:
    
    @staticmethod
    def _apply_date_filter(query: Any, model_col: Any, start_date: Optional[datetime], end_date: Optional[datetime]) -> Any:
        if start_date:
            query = query.filter(model_col >= start_date)
        if end_date:
            query = query.filter(model_col <= end_date)
        return query

    @staticmethod
    def get_dashboard_kpis(db: Session, company_id: str, start_date: Optional[datetime] = None, end_date: Optional[datetime] = None) -> Dict[str, Any]:
        now = datetime.now(timezone.utc)
        today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
        week_start = today_start - timedelta(days=now.weekday())
        month_start = today_start.replace(day=1)

        # Revenue
        rev_query = db.query(
            func.coalesce(func.sum(Order.amount), 0.0).label('total'),
            func.sum(case((Order.created_at >= today_start, Order.amount), else_=0)).label('today'),
            func.sum(case((Order.created_at >= week_start, Order.amount), else_=0)).label('week'),
            func.sum(case((Order.created_at >= month_start, Order.amount), else_=0)).label('month')
        ).filter(Order.company_id == company_id, Order.is_deleted == False)
        
        # If user passed a global date filter, it will only restrict the total (and today/week/month relative to that filter)
        rev_query = AnalyticsService._apply_date_filter(rev_query, Order.created_at, start_date, end_date)
        revenue = rev_query.first()
        
        # Orders
        ord_query = db.query(
            func.count(Order.id).label('total'),
            func.sum(case((Order.order_status == OrderStatus.PENDING.value, 1), else_=0)).label('pending'),
            func.sum(case((Order.order_status == OrderStatus.PLANNING.value, 1), else_=0)).label('planning'),
            func.sum(case((Order.order_status == OrderStatus.ASSIGNED.value, 1), else_=0)).label('assigned'),
            func.sum(case((Order.order_status == OrderStatus.DELIVERED.value, 1), else_=0)).label('delivered'),
            func.sum(case((Order.order_status == OrderStatus.CANCELLED.value, 1), else_=0)).label('cancelled')
        ).filter(Order.company_id == company_id, Order.is_deleted == False)
        ord_query = AnalyticsService._apply_date_filter(ord_query, Order.created_at, start_date, end_date)
        orders = ord_query.first()

        # Trips
        trip_query = db.query(
            func.count(Trip.id).label('total'),
            func.sum(case((Trip.trip_status == TripStatus.STARTED.value, 1), else_=0)).label('active'),
            func.sum(case((Trip.trip_status == TripStatus.COMPLETED.value, 1), else_=0)).label('completed')
        ).filter(Trip.company_id == company_id, Trip.is_deleted == False)
        trip_query = AnalyticsService._apply_date_filter(trip_query, Trip.created_at, start_date, end_date)
        trips = trip_query.first()

        # Drivers
        drivers = db.query(
            func.count(Driver.id).label('total'),
            func.sum(case((Driver.availability_status == 'available', 1), else_=0)).label('available'),
            func.sum(case((Driver.availability_status == 'on_trip', 1), else_=0)).label('active'),
            func.sum(case((Driver.availability_status == 'on_leave', 1), else_=0)).label('on_leave')
        ).filter(Driver.company_id == company_id, Driver.is_deleted == False).first()

        # Vehicles
        vehicles = db.query(
            func.count(Vehicle.id).label('total'),
            func.sum(case((Vehicle.availability_status == 'available', 1), else_=0)).label('available'),
            func.sum(case((Vehicle.availability_status == 'on_trip', 1), else_=0)).label('active'),
            func.sum(case((Vehicle.availability_status == 'maintenance', 1), else_=0)).label('maintenance')
        ).filter(Vehicle.company_id == company_id, Vehicle.is_deleted == False).first()

        return {
            "revenue": {"total": float(revenue.total or 0), "today": float(revenue.today or 0), "week": float(revenue.week or 0), "month": float(revenue.month or 0)},
            "orders": {"total": orders.total or 0, "pending": orders.pending or 0, "planning": orders.planning or 0, "assigned": orders.assigned or 0, "delivered": orders.delivered or 0, "cancelled": orders.cancelled or 0},
            "trips": {"total": trips.total or 0, "active": trips.active or 0, "completed": trips.completed or 0},
            "drivers": {"total": drivers.total or 0, "available": drivers.available or 0, "active": drivers.active or 0, "on_leave": drivers.on_leave or 0},
            "vehicles": {"total": vehicles.total or 0, "available": vehicles.available or 0, "active": vehicles.active or 0, "maintenance": vehicles.maintenance or 0}
        }

    @staticmethod
    def get_revenue_trend(db: Session, company_id: str, start_date: Optional[datetime] = None, end_date: Optional[datetime] = None) -> List[Dict[str, Any]]:
        # Group revenue and expenses by Date
        # Simplified: PostgreSQL DATE(created_at)
        
        # Revenue by day
        rev_q = db.query(
            func.date(Order.created_at).label('date'),
            func.sum(Order.amount).label('revenue')
        ).filter(Order.company_id == company_id, Order.is_deleted == False)
        rev_q = AnalyticsService._apply_date_filter(rev_q, Order.created_at, start_date, end_date)
        revenues = rev_q.group_by(func.date(Order.created_at)).order_by(func.date(Order.created_at)).all()

        # Fuel by day
        fuel_q = db.query(
            func.date(FuelEntry.date).label('date'),
            func.sum(FuelEntry.amount).label('fuel_cost')
        ).filter(FuelEntry.company_id == company_id)
        fuel_q = AnalyticsService._apply_date_filter(fuel_q, FuelEntry.date, start_date, end_date)
        fuels = fuel_q.group_by(func.date(FuelEntry.date)).all()

        # Expenses by day
        # Join trip to get company_id
        exp_q = db.query(
            func.date(Expense.created_at).label('date'),
            func.sum(Expense.amount).label('other_cost')
        ).join(Trip, Expense.trip_id == Trip.id).filter(Trip.company_id == company_id, Expense.is_deleted == False)
        exp_q = AnalyticsService._apply_date_filter(exp_q, Expense.created_at, start_date, end_date)
        expenses = exp_q.group_by(func.date(Expense.created_at)).all()

        # Merge results locally
        trend_dict = {}
        for r in revenues:
            trend_dict[str(r.date)] = {"date": str(r.date), "revenue": float(r.revenue or 0), "expenses": 0.0}
        
        for f in fuels:
            d = str(f.date)
            if d not in trend_dict:
                trend_dict[d] = {"date": d, "revenue": 0.0, "expenses": 0.0}
            trend_dict[d]["expenses"] += float(f.fuel_cost or 0)
            
        for e in expenses:
            d = str(e.date)
            if d not in trend_dict:
                trend_dict[d] = {"date": d, "revenue": 0.0, "expenses": 0.0}
            trend_dict[d]["expenses"] += float(e.other_cost or 0)

        return sorted(list(trend_dict.values()), key=lambda x: x["date"])

    @staticmethod
    def get_driver_performance(db: Session, company_id: str, start_date: Optional[datetime] = None, end_date: Optional[datetime] = None) -> List[Dict[str, Any]]:
        # For each driver: Completed Trips, Revenue (Sum of assigned orders), Total Distance
        query = db.query(
            Driver.id,
            Driver.name,
            func.count(Order.id).label('total_orders'),
            func.sum(case((Order.order_status == OrderStatus.DELIVERED.value, 1), else_=0)).label('completed_orders'),
            func.coalesce(func.sum(Order.amount), 0.0).label('revenue_generated')
        ).outerjoin(Order, Order.assigned_driver_id == Driver.id).filter(
            Driver.company_id == company_id, 
            Driver.is_deleted == False
        )
        query = AnalyticsService._apply_date_filter(query, Order.created_at, start_date, end_date)
        
        results = query.group_by(Driver.id, Driver.name).all()
        
        # We also want distance from trips and average delivery time, but complex joins might be slow.
        # We'll implement distance natively if we can outer join trip to order but it's simpler to do a subquery or separate query.
        
        driver_stats = []
        for r in results:
            driver_stats.append({
                "driver_id": r.id,
                "name": r.name,
                "total_orders": r.total_orders,
                "completed_orders": r.completed_orders,
                "revenue_generated": float(r.revenue_generated),
                "performance_score": min(100, int((r.completed_orders / max(1, r.total_orders)) * 100)) if r.total_orders else 0
            })
            
        return sorted(driver_stats, key=lambda x: x['performance_score'], reverse=True)

    @staticmethod
    def get_trip_analytics(db: Session, company_id: str, start_date: Optional[datetime] = None, end_date: Optional[datetime] = None) -> Dict[str, Any]:
        # Average Delivery Time, Cost Per Trip, Profit Per Trip
        
        # We need orders that have a trip assigned
        trip_orders = db.query(
            Trip.id,
            func.sum(Order.amount).label('revenue'),
            func.max(Order.expected_delivery_date).label('expected'),
            func.max(Trip.end_time).label('actual_end')
        ).outerjoin(Order, Order.trip_id == Trip.id).filter(Trip.company_id == company_id, Trip.is_deleted == False)
        trip_orders = AnalyticsService._apply_date_filter(trip_orders, Trip.created_at, start_date, end_date)
        trip_data = trip_orders.group_by(Trip.id).all()
        
        trip_expenses = db.query(
            Expense.trip_id,
            func.sum(Expense.amount).label('cost')
        ).join(Trip, Expense.trip_id == Trip.id).filter(Trip.company_id == company_id, Expense.is_deleted == False)
        trip_expenses = AnalyticsService._apply_date_filter(trip_expenses, Expense.created_at, start_date, end_date)
        expense_data = trip_expenses.group_by(Expense.trip_id).all()
        
        expense_map = {e.trip_id: e.cost for e in expense_data}
        
        total_trips = len(trip_data)
        total_cost = 0.0
        total_revenue = 0.0
        delayed_trips = 0
        
        for t in trip_data:
            cost = expense_map.get(t.id, 0.0)
            total_cost += cost
            total_revenue += (t.revenue or 0.0)
            if t.expected and t.actual_end and t.actual_end > t.expected:
                delayed_trips += 1
                
        profit = total_revenue - total_cost
                
        return {
            "total_trips": total_trips,
            "delayed_trips": delayed_trips,
            "average_cost_per_trip": round(total_cost / total_trips, 2) if total_trips else 0.0,
            "average_profit_per_trip": round(profit / total_trips, 2) if total_trips else 0.0,
        }

    @staticmethod
    def get_fuel_analytics(db: Session, company_id: str, start_date: Optional[datetime] = None, end_date: Optional[datetime] = None) -> Dict[str, Any]:
        now = datetime.now(timezone.utc)
        today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
        month_start = today_start.replace(day=1)

        base_q = db.query(FuelEntry).filter(FuelEntry.company_id == company_id)
        
        today_q = base_q.filter(FuelEntry.date >= today_start)
        month_q = base_q.filter(FuelEntry.date >= month_start)
        
        today_cost = db.query(func.coalesce(func.sum(FuelEntry.amount), 0.0)).filter(FuelEntry.company_id == company_id, FuelEntry.date >= today_start).scalar()
        month_cost = db.query(func.coalesce(func.sum(FuelEntry.amount), 0.0)).filter(FuelEntry.company_id == company_id, FuelEntry.date >= month_start).scalar()

        fuel_entries = db.query(FuelEntry.trip_id, FuelEntry.amount).filter(FuelEntry.company_id == company_id)
        fuel_entries = AnalyticsService._apply_date_filter(fuel_entries, FuelEntry.date, start_date, end_date).all()
        
        trip_vehicles = db.query(Order.trip_id, Vehicle.plate_number)\
            .join(Vehicle, Order.assigned_vehicle_id == Vehicle.id)\
            .filter(Order.company_id == company_id)\
            .filter(Order.trip_id.isnot(None))\
            .distinct().all()
            
        trip_to_plate = {tv.trip_id: tv.plate_number for tv in trip_vehicles}
        
        vehicle_costs = {}
        for fe in fuel_entries:
            plate = trip_to_plate.get(fe.trip_id, "Unknown")
            vehicle_costs[plate] = vehicle_costs.get(plate, 0.0) + float(fe.amount or 0.0)
            
        by_vehicle_res = [{"vehicle": p, "total_cost": c} for p, c in vehicle_costs.items()]

        by_driver = db.query(
            Driver.name,
            func.sum(FuelEntry.amount).label('total_cost')
        ).join(FuelEntry, FuelEntry.driver_id == Driver.id).filter(Driver.company_id == company_id)
        by_driver = AnalyticsService._apply_date_filter(by_driver, FuelEntry.date, start_date, end_date)
        by_driver_res = by_driver.group_by(Driver.name).all()

        return {
            "today_cost": float(today_cost),
            "month_cost": float(month_cost),
            "by_vehicle": [{"vehicle": r["vehicle"], "cost": float(r["total_cost"])} for r in by_vehicle_res],
            "by_driver": [{"driver": r.name, "cost": float(r.total_cost or 0)} for r in by_driver_res]
        }

    @staticmethod
    def get_vehicle_analytics(db: Session, company_id: str, start_date: Optional[datetime] = None, end_date: Optional[datetime] = None) -> List[Dict[str, Any]]:
        # Vehicle utilization
        v_query = db.query(
            Vehicle.id,
            Vehicle.plate_number,
            Vehicle.availability_status
        ).filter(Vehicle.company_id == company_id, Vehicle.is_deleted == False)
        
        vehicles = v_query.all()
        
        stats = []
        for v in vehicles:
            stats.append({
                "vehicle_id": v.id,
                "plate_number": v.plate_number,
                "status": v.availability_status,
                "utilization_pct": 100 if v.availability_status == 'on_trip' else 0, # Simple mock metric
                "maintenance_due": v.availability_status == 'maintenance'
            })
            
        return stats

    @staticmethod
    def get_customer_analytics(db: Session, company_id: str, start_date: Optional[datetime] = None, end_date: Optional[datetime] = None) -> List[Dict[str, Any]]:
        c_query = db.query(
            Customer.id,
            Customer.name,
            func.count(Order.id).label('total_orders'),
            func.sum(Order.amount).label('total_revenue')
        ).outerjoin(Order, Order.customer_id == Customer.id).filter(Customer.company_id == company_id, Customer.is_deleted == False)
        c_query = AnalyticsService._apply_date_filter(c_query, Order.created_at, start_date, end_date)
        
        results = c_query.group_by(Customer.id, Customer.name).order_by(desc('total_revenue')).limit(10).all()
        
        return [
            {
                "customer_id": r.id,
                "name": r.name,
                "total_orders": r.total_orders or 0,
                "total_revenue": float(r.total_revenue or 0)
            } for r in results
        ]

    @staticmethod
    def get_financial_analytics(db: Session, company_id: str, start_date: Optional[datetime] = None, end_date: Optional[datetime] = None) -> Dict[str, float]:
        # Total Revenue
        rev_q = db.query(func.coalesce(func.sum(Order.amount), 0.0)).filter(Order.company_id == company_id, Order.is_deleted == False)
        rev_q = AnalyticsService._apply_date_filter(rev_q, Order.created_at, start_date, end_date)
        revenue = float(rev_q.scalar())

        # Total Fuel Cost
        fuel_q = db.query(func.coalesce(func.sum(FuelEntry.amount), 0.0)).filter(FuelEntry.company_id == company_id)
        fuel_q = AnalyticsService._apply_date_filter(fuel_q, FuelEntry.date, start_date, end_date)
        fuel_cost = float(fuel_q.scalar())

        # Total Other Expenses
        exp_q = db.query(func.coalesce(func.sum(Expense.amount), 0.0)).join(Trip, Expense.trip_id == Trip.id).filter(Trip.company_id == company_id, Expense.is_deleted == False)
        exp_q = AnalyticsService._apply_date_filter(exp_q, Expense.created_at, start_date, end_date)
        other_expenses = float(exp_q.scalar())

        total_expenses = fuel_cost + other_expenses
        profit = revenue - total_expenses
        margin = (profit / revenue * 100) if revenue > 0 else 0.0

        return {
            "revenue": revenue,
            "expenses": total_expenses,
            "fuel_cost": fuel_cost,
            "other_expenses": other_expenses,
            "profit": profit,
            "profit_margin_pct": round(margin, 2)
        }

analytics_service = AnalyticsService()
