import uuid
from sqlalchemy import Column, String, Float, ForeignKey, DateTime
from app.database.session import Base
from app.models.mixins import TimestampMixin

class FuelEntry(Base, TimestampMixin):
    __tablename__ = "fuel_entries"

    id = Column(String, primary_key=True, index=True, default=lambda: str(uuid.uuid4()))
    company_id = Column(String, ForeignKey("companies.id"), nullable=False, index=True)
    driver_id = Column(String, ForeignKey("drivers.id"), nullable=False, index=True)
    trip_id = Column(String, ForeignKey("trips.id"), nullable=True, index=True)
    
    date = Column(DateTime, nullable=False)
    station = Column(String, nullable=False)
    amount = Column(Float, nullable=False)
    quantity = Column(Float, nullable=False)
    odometer = Column(Float, nullable=False)
    notes = Column(String, nullable=True)
    receipt_url = Column(String, nullable=True)
