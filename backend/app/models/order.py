import uuid
from sqlalchemy import Column, String, ForeignKey, DateTime, Float
from sqlalchemy.orm import relationship
from app.database.session import Base
from app.models.mixins import TimestampMixin, SoftDeleteMixin
from app.models.enums import OrderStatus

class Order(Base, TimestampMixin, SoftDeleteMixin):
    __tablename__ = "orders"

    id = Column(String, primary_key=True, index=True, default=lambda: str(uuid.uuid4()))
    company_id = Column(String, ForeignKey("companies.id"), nullable=False, index=True)
    customer_id = Column(String, ForeignKey("customers.id"), nullable=True, index=True)
    
    assigned_driver_id = Column(String, ForeignKey("drivers.id"), nullable=True, index=True)
    assigned_vehicle_id = Column(String, ForeignKey("vehicles.id"), nullable=True, index=True)
    trip_id = Column(String, ForeignKey("trips.id"), nullable=True, index=True)
    
    order_status = Column(String, default=OrderStatus.PLANNING.value, nullable=False)
    assigned_at = Column(DateTime(timezone=True), nullable=True)
    
    pickup_location = Column(String, nullable=True)
    delivery_location = Column(String, nullable=True)
    expected_delivery_date = Column(DateTime(timezone=True), nullable=True)
    amount = Column(Float, default=0.0, nullable=False)

    company = relationship("Company", back_populates="orders")
    customer = relationship("Customer", back_populates="orders")
    assigned_driver = relationship("Driver", back_populates="orders", foreign_keys=[assigned_driver_id])
    assigned_vehicle = relationship("Vehicle", back_populates="orders", foreign_keys=[assigned_vehicle_id])
    trip = relationship("Trip", back_populates="orders")
