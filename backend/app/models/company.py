import uuid
from sqlalchemy import Column, String, Boolean
from sqlalchemy.orm import relationship
from app.database.session import Base
from app.models.mixins import TimestampMixin, SoftDeleteMixin

class Company(Base, TimestampMixin, SoftDeleteMixin):
    __tablename__ = "companies"

    id = Column(String, primary_key=True, index=True, default=lambda: str(uuid.uuid4()))
    name = Column(String, nullable=False)
    slug = Column(String, unique=True, index=True, nullable=False)
    is_active = Column(Boolean, default=True)
    tax_id = Column(String, nullable=True)
    address = Column(String, nullable=True)
    contact_email = Column(String, nullable=True)

    users = relationship("User", back_populates="company")
    drivers = relationship("Driver", back_populates="company")
    vehicles = relationship("Vehicle", back_populates="company")
    customers = relationship("Customer", back_populates="company")
    orders = relationship("Order", back_populates="company")
    trips = relationship("Trip", back_populates="company")
