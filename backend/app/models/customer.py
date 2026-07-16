import uuid
from sqlalchemy import Column, String, ForeignKey
from sqlalchemy.orm import relationship
from app.database.session import Base
from app.models.mixins import TimestampMixin, SoftDeleteMixin

class Customer(Base, TimestampMixin, SoftDeleteMixin):
    __tablename__ = "customers"

    id = Column(String, primary_key=True, index=True, default=lambda: str(uuid.uuid4()))
    company_id = Column(String, ForeignKey("companies.id"), nullable=False, index=True)
    name = Column(String, nullable=False)
    email = Column(String, nullable=True)
    phone = Column(String, nullable=True)
    billing_address = Column(String, nullable=True)

    company = relationship("Company", back_populates="customers")
    orders = relationship("Order", back_populates="customer")
