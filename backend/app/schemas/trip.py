from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import datetime

class TripBase(BaseModel):
    trip_status: Optional[str] = "created"
    origin: Optional[str] = None
    destination: Optional[str] = None
    delivery_notes: Optional[str] = None

class TripCreate(TripBase):
    pass

class TripUpdate(BaseModel):
    trip_status: Optional[str] = None
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None
    origin: Optional[str] = None
    destination: Optional[str] = None
    current_location: Optional[str] = None
    distance_travelled: Optional[float] = None
    delivery_notes: Optional[str] = None

class TripResponse(TripBase):
    id: str
    company_id: str
    start_time: Optional[datetime]
    end_time: Optional[datetime]
    current_location: Optional[str]
    distance_travelled: float
    fuel_cost: Optional[float] = 0.0
    other_expenses: Optional[float] = 0.0
    total_cost: float
    revenue: float
    net_profit: float
    profit_margin: float
    created_at: datetime
    updated_at: datetime
    
    model_config = ConfigDict(from_attributes=True)

class DriverTripResponse(TripBase):
    id: str
    company_id: str
    start_time: Optional[datetime]
    end_time: Optional[datetime]
    current_location: Optional[str]
    distance_travelled: float
    created_at: datetime
    updated_at: datetime
    
    model_config = ConfigDict(from_attributes=True)
