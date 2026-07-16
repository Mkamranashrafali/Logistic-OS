from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import datetime

class VehicleBase(BaseModel):
    make: Optional[str] = None
    model: Optional[str] = None
    plate_number: str
    capacity: Optional[int] = None
    availability_status: Optional[str] = "available"

class VehicleCreate(VehicleBase):
    pass

class VehicleUpdate(BaseModel):
    make: Optional[str] = None
    model: Optional[str] = None
    plate_number: Optional[str] = None
    capacity: Optional[int] = None
    availability_status: Optional[str] = None
    current_trip_id: Optional[str] = None

class VehicleResponse(VehicleBase):
    id: str
    company_id: str
    current_trip_id: Optional[str]
    created_at: datetime
    updated_at: datetime
    
    model_config = ConfigDict(from_attributes=True)
