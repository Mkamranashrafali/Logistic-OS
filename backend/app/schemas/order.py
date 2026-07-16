from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import datetime

class OrderBase(BaseModel):
    customer_id: Optional[str] = None
    pickup_location: Optional[str] = None
    delivery_location: Optional[str] = None
    expected_delivery_date: Optional[datetime] = None
    amount: Optional[float] = 0.0

class OrderCreate(OrderBase):
    pass

class OrderUpdate(BaseModel):
    customer_id: Optional[str] = None
    assigned_driver_id: Optional[str] = None
    assigned_vehicle_id: Optional[str] = None
    trip_id: Optional[str] = None
    order_status: Optional[str] = None
    assigned_at: Optional[datetime] = None
    pickup_location: Optional[str] = None
    delivery_location: Optional[str] = None
    expected_delivery_date: Optional[datetime] = None
    amount: Optional[float] = None

class OrderResponse(OrderBase):
    id: str
    company_id: str
    assigned_driver_id: Optional[str]
    assigned_vehicle_id: Optional[str]
    trip_id: Optional[str]
    order_status: str
    assigned_at: Optional[datetime]
    created_at: datetime
    updated_at: datetime
    
    model_config = ConfigDict(from_attributes=True)
