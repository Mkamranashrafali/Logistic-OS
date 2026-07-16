import uuid
from sqlalchemy import Column, String, ForeignKey
from sqlalchemy.orm import relationship
from app.database.session import Base
from app.models.mixins import TimestampMixin, SoftDeleteMixin
from app.models.enums import DriverStatus

class Driver(Base, TimestampMixin, SoftDeleteMixin):
    __tablename__ = "drivers"

    id = Column(String, primary_key=True, index=True, default=lambda: str(uuid.uuid4()))
    company_id = Column(String, ForeignKey("companies.id"), nullable=False, index=True)
    user_id = Column(String, ForeignKey("users.id"), nullable=True, index=True)
    
    name = Column(String, nullable=False)
    license_number = Column(String, nullable=True)
    phone = Column(String, nullable=True)
    
    availability_status = Column(String, default=DriverStatus.AVAILABLE.value, nullable=False)
    current_trip_id = Column(String, ForeignKey("trips.id"), nullable=True)

    company = relationship("Company", back_populates="drivers")
    orders = relationship("Order", back_populates="assigned_driver")
    current_trip = relationship("Trip", foreign_keys=[current_trip_id])
    user = relationship("User", foreign_keys=[user_id])
