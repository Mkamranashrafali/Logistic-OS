import uuid
from sqlalchemy import Column, String, ForeignKey, DateTime
from datetime import datetime, timezone
from app.database.session import Base

class TripActivityLog(Base):
    __tablename__ = "trip_activity_logs"

    id = Column(String, primary_key=True, index=True, default=lambda: str(uuid.uuid4()))
    company_id = Column(String, ForeignKey("companies.id"), nullable=False, index=True)
    trip_id = Column(String, ForeignKey("trips.id"), nullable=False, index=True)
    driver_id = Column(String, ForeignKey("drivers.id"), nullable=False, index=True)
    
    action_type = Column(String, nullable=False) # e.g. "ASSIGNED", "STARTED", "PAUSED", "RESUMED", "FUEL_ADDED", "RECEIPT_UPLOADED", "COMPLETED"
    notes = Column(String, nullable=True)
    timestamp = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
