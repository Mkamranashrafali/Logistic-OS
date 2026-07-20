import uuid
from sqlalchemy import Column, String, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from app.database.session import Base
from app.models.mixins import TimestampMixin, SoftDeleteMixin
from app.models.enums import DriverStatus, DriverLifecycleStatus

class Driver(Base, TimestampMixin, SoftDeleteMixin):
    __tablename__ = "drivers"

    id = Column(String, primary_key=True, index=True, default=lambda: str(uuid.uuid4()))
    company_id = Column(String, ForeignKey("companies.id"), nullable=False, index=True)
    user_id = Column(String, ForeignKey("users.id"), nullable=True, index=True)
    
    name = Column(String, nullable=False)
    email = Column(String, nullable=True)
    license_number = Column(String, nullable=True)
    phone = Column(String, nullable=True)
    
    availability_status = Column(String, default=DriverStatus.AVAILABLE.value, nullable=False, index=True)
    current_trip_id = Column(String, ForeignKey("trips.id"), nullable=True)
    
    # Lifecycle
    lifecycle_status = Column(String, default=DriverLifecycleStatus.PENDING.value, nullable=False, index=True)
    terminated_at = Column(DateTime(timezone=True), nullable=True)
    terminated_by = Column(String, nullable=True) # User ID who terminated
    termination_reason = Column(String, nullable=True)

    company = relationship("Company", back_populates="drivers")
    orders = relationship("Order", back_populates="assigned_driver")
    current_trip = relationship("Trip", foreign_keys=[current_trip_id])
    user = relationship("User", foreign_keys=[user_id])
