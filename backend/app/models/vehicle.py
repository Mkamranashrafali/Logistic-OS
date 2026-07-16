import uuid
from sqlalchemy import Column, String, ForeignKey, Integer
from sqlalchemy.orm import relationship
from app.database.session import Base
from app.models.mixins import TimestampMixin, SoftDeleteMixin
from app.models.enums import VehicleStatus

class Vehicle(Base, TimestampMixin, SoftDeleteMixin):
    __tablename__ = "vehicles"

    id = Column(String, primary_key=True, index=True, default=lambda: str(uuid.uuid4()))
    company_id = Column(String, ForeignKey("companies.id"), nullable=False, index=True)
    
    make = Column(String, nullable=True)
    model = Column(String, nullable=True)
    plate_number = Column(String, nullable=False)
    capacity = Column(Integer, nullable=True)
    
    availability_status = Column(String, default=VehicleStatus.AVAILABLE.value, nullable=False)
    current_trip_id = Column(String, ForeignKey("trips.id"), nullable=True)

    company = relationship("Company", back_populates="vehicles")
    orders = relationship("Order", back_populates="assigned_vehicle")
    current_trip = relationship("Trip", foreign_keys=[current_trip_id])
