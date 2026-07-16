import uuid
from sqlalchemy import Column, String, ForeignKey, Float
from sqlalchemy.orm import relationship
from app.database.session import Base
from app.models.mixins import TimestampMixin, SoftDeleteMixin

class Expense(Base, TimestampMixin, SoftDeleteMixin):
    __tablename__ = "expenses"

    id = Column(String, primary_key=True, index=True, default=lambda: str(uuid.uuid4()))
    trip_id = Column(String, ForeignKey("trips.id"), nullable=False, index=True)
    amount = Column(Float, nullable=False)
    category = Column(String, nullable=True)
    description = Column(String, nullable=True)

    trip = relationship("Trip", back_populates="expenses")
