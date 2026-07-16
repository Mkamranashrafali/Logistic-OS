from sqlalchemy.orm import Session
from sqlalchemy import func, case, extract, desc
from datetime import datetime, timedelta, timezone
from typing import Optional, Dict, Any, List

from app.models.order import Order
from app.models.trip import Trip
from app.models.expense import Expense
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
            func.coalesce(func.sum(Order.deal_price), 0.0).label('total'),
            func.sum(case((Order.created_at >= today_start, Order.deal_price), else_=0)).label('today'),
            func.sum(case((Order.created_at >= week_start, Order.deal_price), else_=0)).label('week'),
            func.sum(case((Order.created_at >= month_start, Order.deal_price), else_=0)).label('month')
        ).filter(Order.company_id == company_id, Order.is_deleted == False)
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
            func.sum(Order.deal_price).label('revenue')
        ).filter(Order.company_id == company_id, Order.is_deleted == False)
        rev_q = AnalyticsService._apply_date_filter(rev_q, Order.created_at, start_date, end_date)
        revenues = rev_q.group_by(func.date(Order.created_at)).order_by(func.date(Order.created_at)).all()

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
            func.coalesce(func.sum(Order.deal_price), 0.0).label('revenue_generated')
        ).outerjoin(Order, Order.assigned_driver_id == Driver.id).filter(
            Driver.company_id == company_id, 
            Driver.is_deleted == False
        )
        query = AnalyticsService._apply_date_filter(query, Order.created_at, start_date, end_date)
        
        results = query.group_by(Driver.id, Driver.name).all()
        
        # We also want distance from trips and average delivery time, but complex joins might be slow.
        # We'll implement distance natively if we can outer join trip to order but it's simpler to do a subquery or separate query.
        
        # Bulk query for profits
        driver_profit_q = db.query(Order.assigned_driver_id, func.sum(Trip.net_profit)).join(Order, Order.trip_id == Trip.id).filter(Trip.company_id == company_id, Trip.is_deleted == False)
        driver_profit_q = AnalyticsService._apply_date_filter(driver_profit_q, Trip.created_at, start_date, end_date)
        driver_profits_result = driver_profit_q.group_by(Order.assigned_driver_id).all()
        driver_profits = {row[0]: float(row[1] or 0.0) for row in driver_profits_result}
        
        driver_stats = []
        for r in results:
            driver_profit = driver_profits.get(r.id, 0.0)

            driver_stats.append({
                "driver_id": r.id,
                "name": r.name,
                "total_orders": r.total_orders,
                "completed_orders": r.completed_orders,
                "revenue_generated": float(r.revenue_generated),
                "profit": float(driver_profit),
                "performance_score": min(100, int((r.completed_orders / max(1, r.total_orders)) * 100)) if r.total_orders else 0
            })
            
        return sorted(driver_stats, key=lambda x: x['profit'], reverse=True)

    @staticmethod
    def get_trip_analytics(db: Session, company_id: str, start_date: Optional[datetime] = None, end_date: Optional[datetime] = None) -> Dict[str, Any]:
        trip_data_q = db.query(
            func.count(Trip.id).label('total_trips'),
            func.avg(Trip.total_cost).label('avg_cost'),
            func.avg(Trip.net_profit).label('avg_profit'),
            func.sum(Trip.total_cost).label('total_cost'),
            func.sum(Trip.revenue).label('total_revenue')
        ).filter(Trip.company_id == company_id, Trip.is_deleted == False)
        trip_data_q = AnalyticsService._apply_date_filter(trip_data_q, Trip.created_at, start_date, end_date)
        agg = trip_data_q.first()
        
        # Determine delayed trips directly in SQL
        delayed_trips_q = db.query(func.count(Trip.id)).join(Order, Order.trip_id == Trip.id).filter(
            Trip.company_id == company_id, 
            Trip.is_deleted == False,
            Trip.end_time != None,
            Order.expected_delivery_date != None,
            Trip.end_time > Order.expected_delivery_date
        )
        delayed_trips_q = AnalyticsService._apply_date_filter(delayed_trips_q, Trip.created_at, start_date, end_date)
        delayed_trips = delayed_trips_q.scalar() or 0
                
        most_profitable = db.query(Trip).filter(Trip.company_id == company_id, Trip.is_deleted == False).order_by(desc(Trip.net_profit)).first()
        least_profitable = db.query(Trip).filter(Trip.company_id == company_id, Trip.is_deleted == False).order_by(Trip.net_profit).first()

        return {
            "total_trips": agg.total_trips or 0,
            "delayed_trips": delayed_trips,
            "average_cost_per_trip": round(float(agg.avg_cost or 0), 2),
            "average_profit_per_trip": round(float(agg.avg_profit or 0), 2),
            "most_profitable_trip": most_profitable.id if most_profitable else None,
            "most_profitable_amount": float(most_profitable.net_profit) if most_profitable else 0,
            "least_profitable_trip": least_profitable.id if least_profitable else None,
            "least_profitable_amount": float(least_profitable.net_profit) if least_profitable else 0,
        }

    @staticmethod
    def get_fuel_analytics(db: Session, company_id: str, start_date: Optional[datetime] = None, end_date: Optional[datetime] = None) -> Dict[str, Any]:
        now = datetime.now(timezone.utc)
        today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
        month_start = today_start.replace(day=1)

        base_q = db.query(Expense).join(Trip, Expense.trip_id == Trip.id).filter(Trip.company_id == company_id, Expense.category == 'Fuel')
        
        today_cost = base_q.filter(Expense.date >= today_start).with_entities(func.coalesce(func.sum(Expense.amount), 0.0)).scalar()
        month_cost = base_q.filter(Expense.date >= month_start).with_entities(func.coalesce(func.sum(Expense.amount), 0.0)).scalar()

        fuel_entries = base_q.with_entities(Expense.trip_id, Expense.amount)
        fuel_entries = AnalyticsService._apply_date_filter(fuel_entries, Expense.date, start_date, end_date).all()
        
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
            func.sum(Expense.amount).label('total_cost')
        ).join(Order, Order.assigned_driver_id == Driver.id)\
         .join(Expense, Expense.trip_id == Order.trip_id)\
         .filter(Driver.company_id == company_id, Expense.category == 'Fuel')
         
        by_driver = AnalyticsService._apply_date_filter(by_driver, Expense.date, start_date, end_date)
        by_driver_res = by_driver.group_by(Driver.name).all()

        return {
            "today_cost": float(today_cost or 0.0),
            "month_cost": float(month_cost or 0.0),
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
        
        # Bulk query for vehicle profits
        vehicle_profit_q = db.query(Order.assigned_vehicle_id, func.sum(Trip.net_profit)).join(Order, Order.trip_id == Trip.id).filter(Trip.company_id == company_id, Trip.is_deleted == False)
        vehicle_profit_q = AnalyticsService._apply_date_filter(vehicle_profit_q, Trip.created_at, start_date, end_date)
        vehicle_profits_result = vehicle_profit_q.group_by(Order.assigned_vehicle_id).all()
        vehicle_profits = {row[0]: float(row[1] or 0.0) for row in vehicle_profits_result}
        
        stats = []
        for v in vehicles:
            vehicle_profit = vehicle_profits.get(v.id, 0.0)

            stats.append({
                "vehicle_id": v.id,
                "plate_number": v.plate_number,
                "status": v.availability_status,
                "utilization_pct": 100 if v.availability_status == 'on_trip' else 0, # Simple mock metric
                "maintenance_due": v.availability_status == 'maintenance',
                "profit": float(vehicle_profit)
            })
            
        return sorted(stats, key=lambda x: x['profit'], reverse=True)

    @staticmethod
    def get_customer_analytics(db: Session, company_id: str, start_date: Optional[datetime] = None, end_date: Optional[datetime] = None) -> List[Dict[str, Any]]:
        c_query = db.query(
            Customer.id,
            Customer.name,
            func.count(Order.id).label('total_orders'),
            func.sum(Order.deal_price).label('total_revenue')
        ).outerjoin(Order, Order.customer_id == Customer.id).filter(Customer.company_id == company_id, Customer.is_deleted == False)
        c_query = AnalyticsService._apply_date_filter(c_query, Order.created_at, start_date, end_date)
        
        results = c_query.group_by(Customer.id, Customer.name).order_by(desc('total_revenue')).limit(10).all()
        
        # Bulk query for customer profits
        customer_profit_q = db.query(Order.customer_id, func.sum(Trip.net_profit)).join(Order, Order.trip_id == Trip.id).filter(Trip.company_id == company_id, Trip.is_deleted == False)
        customer_profit_q = AnalyticsService._apply_date_filter(customer_profit_q, Trip.created_at, start_date, end_date)
        customer_profits_result = customer_profit_q.group_by(Order.customer_id).all()
        customer_profits = {row[0]: float(row[1] or 0.0) for row in customer_profits_result}
        
        c_stats = []
        for r in results:
            customer_profit = customer_profits.get(r.id, 0.0)

            c_stats.append({
                "customer_id": r.id,
                "name": r.name,
                "total_orders": r.total_orders or 0,
                "total_revenue": float(r.total_revenue or 0),
                "profit": float(customer_profit)
            })
            
        return sorted(c_stats, key=lambda x: x['profit'], reverse=True)

    @staticmethod
    def get_financial_analytics(db: Session, company_id: str, start_date: Optional[datetime] = None, end_date: Optional[datetime] = None) -> Dict[str, Any]:
        # Total Revenue
        rev_q = db.query(func.coalesce(func.sum(Order.deal_price), 0.0)).filter(Order.company_id == company_id, Order.is_deleted == False)
        rev_q = AnalyticsService._apply_date_filter(rev_q, Order.created_at, start_date, end_date)
        revenue = float(rev_q.scalar())

        # Total Expenses
        exp_q = db.query(Expense.category, func.sum(Expense.amount).label('total')).join(Trip, Expense.trip_id == Trip.id).filter(Trip.company_id == company_id, Expense.is_deleted == False)
        exp_q = AnalyticsService._apply_date_filter(exp_q, Expense.created_at, start_date, end_date)
        expense_rows = exp_q.group_by(Expense.category).all()
        
        expense_breakdown = {}
        total_expenses = 0.0
        fuel_cost = 0.0
        other_expenses = 0.0
        for r in expense_rows:
            cat = r.category or "Other"
            amt = float(r.total or 0.0)
            if cat != 'Delivery Proof':
                total_expenses += amt
                if cat == 'Fuel':
                    fuel_cost += amt
                else:
                    other_expenses += amt
                expense_breakdown[cat] = expense_breakdown.get(cat, 0.0) + amt

        profit = revenue - total_expenses
        margin = (profit / revenue * 100) if revenue > 0 else 0.0

        return {
            "revenue": revenue,
            "expenses": total_expenses,
            "fuel_cost": fuel_cost,
            "other_expenses": other_expenses,
            "profit": profit,
            "profit_margin_pct": round(margin, 2),
            "expense_breakdown": [{"category": k, "amount": v} for k, v in expense_breakdown.items()]
        }

analytics_service = AnalyticsService()
