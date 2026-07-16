from sqlalchemy.orm import Session
from sqlalchemy import func
from app.models.trip import Trip
from app.models.expense import Expense
from app.models.order import Order

class TripFinancialService:
    @staticmethod
    def recalculate_trip_financials(db: Session, trip_id: str) -> Trip:
        """
        Recalculates and updates the total_cost, revenue, net_profit, 
        and profit_margin for a given trip.
        """
        trip = db.query(Trip).filter(Trip.id == trip_id).first()
        if not trip:
            return None

        # 1. Fetch Expenses (Exclude Delivery Proof)
        expenses_query = db.query(Expense).filter(
            Expense.trip_id == trip_id,
            Expense.is_deleted == False,
            Expense.category != 'Delivery Proof'
        ).all()
        
        fuel_cost = 0.0
        other_expenses = 0.0
        
        for e in expenses_query:
            if e.category == 'Fuel':
                fuel_cost += float(e.amount)
            else:
                other_expenses += float(e.amount)

        # 2. Total Trip Cost
        total_cost = fuel_cost + other_expenses

        # 3. Sum Orders (Revenue)
        revenue = db.query(func.coalesce(func.sum(Order.deal_price), 0.0)).filter(
            Order.trip_id == trip_id,
            Order.is_deleted == False
        ).scalar() or 0.0
        revenue = float(revenue)

        # 4. Profit & Margin
        net_profit = revenue - total_cost
        profit_margin = (net_profit / revenue * 100) if revenue > 0 else 0.0

        # Update Trip record
        trip.fuel_cost = fuel_cost
        trip.other_expenses = other_expenses
        trip.total_cost = total_cost
        trip.revenue = revenue
        trip.net_profit = net_profit
        trip.profit_margin = profit_margin

        db.commit()
        db.refresh(trip)
        return trip
