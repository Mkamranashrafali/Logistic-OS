from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import datetime

class DriverBase(BaseModel):
    name: str
    license_number: Optional[str] = None
    phone: Optional[str] = None
    availability_status: Optional[str] = "available"
    user_id: Optional[str] = None

class DriverCreate(DriverBase):
    pass

class DriverUpdate(BaseModel):
    name: Optional[str] = None
    license_number: Optional[str] = None
    phone: Optional[str] = None
    availability_status: Optional[str] = None
    current_trip_id: Optional[str] = None

class DriverResponse(DriverBase):
    id: str
    company_id: str
    current_trip_id: Optional[str]
    created_at: datetime
    updated_at: datetime
    
    model_config = ConfigDict(from_attributes=True)
