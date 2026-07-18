import uuid
from sqlalchemy import Column, String, ForeignKey
from sqlalchemy.orm import relationship
from app.database.session import Base
from app.models.mixins import TimestampMixin, SoftDeleteMixin

class Document(Base, TimestampMixin, SoftDeleteMixin):
    __tablename__ = "documents"

    id = Column(String, primary_key=True, index=True, default=lambda: str(uuid.uuid4()))
    company_id = Column(String, ForeignKey("companies.id"), nullable=False, index=True)
    trip_id = Column(String, ForeignKey("trips.id"), nullable=False, index=True)
    title = Column(String, nullable=False)
    file_path = Column(String, nullable=False)

    trip = relationship("Trip", back_populates="documents")
    company = relationship("Company")
