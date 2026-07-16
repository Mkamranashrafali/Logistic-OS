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

        # 1. Sum Expenses (Excluding Delivery Proof)
        expense_cost = db.query(func.coalesce(func.sum(Expense.amount), 0.0)).filter(
            Expense.trip_id == trip_id,
            Expense.is_deleted == False,
            Expense.category != 'Delivery Proof'
        ).scalar() or 0.0

        total_cost = float(expense_cost)

        # 3. Sum Orders (Revenue)
        revenue = db.query(func.coalesce(func.sum(Order.amount), 0.0)).filter(
            Order.trip_id == trip_id,
            Order.is_deleted == False
        ).scalar() or 0.0
        
        revenue = float(revenue)

        # 4. Calculate Profit
        net_profit = revenue - total_cost
        
        # 5. Calculate Margin
        if revenue > 0:
            profit_margin = (net_profit / revenue) * 100
        else:
            profit_margin = 0.0

        # Update Trip
        trip.total_cost = total_cost
        trip.revenue = revenue
        trip.net_profit = net_profit
        trip.profit_margin = profit_margin

        db.commit()
        db.refresh(trip)
        return trip
