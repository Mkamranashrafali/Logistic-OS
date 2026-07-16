import uuid
from sqlalchemy import Column, String, ForeignKey, DateTime, Float
from sqlalchemy.orm import relationship
from app.database.session import Base
from app.models.mixins import TimestampMixin, SoftDeleteMixin
from app.models.enums import TripStatus

class Trip(Base, TimestampMixin, SoftDeleteMixin):
    __tablename__ = "trips"

    id = Column(String, primary_key=True, index=True, default=lambda: str(uuid.uuid4()))
    company_id = Column(String, ForeignKey("companies.id"), nullable=False, index=True)
    
    trip_status = Column(String, default=TripStatus.CREATED.value, nullable=False, index=True)
    
    start_time = Column(DateTime(timezone=True), nullable=True)
    end_time = Column(DateTime(timezone=True), nullable=True)
    
    origin = Column(String, nullable=True)
    destination = Column(String, nullable=True)
    current_location = Column(String, nullable=True)
    
    distance_travelled = Column(Float, default=0.0)
    delivery_notes = Column(String, nullable=True)
    
    # Financials (Cached)
    fuel_cost = Column(Float, default=0.0)
    other_expenses = Column(Float, default=0.0)
    total_cost = Column(Float, default=0.0, nullable=False)
    revenue = Column(Float, default=0.0, nullable=False)
    net_profit = Column(Float, default=0.0, nullable=False)
    profit_margin = Column(Float, default=0.0, nullable=False)

    company = relationship("Company", back_populates="trips")
    orders = relationship("Order", back_populates="trip")
    expenses = relationship("Expense", back_populates="trip")
    documents = relationship("Document", back_populates="trip")
