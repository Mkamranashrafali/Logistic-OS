from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import datetime

class ExpenseBase(BaseModel):
    trip_id: str
    amount: float
    category: Optional[str] = None
    description: Optional[str] = None

class ExpenseCreate(ExpenseBase):
    pass

class ExpenseUpdate(BaseModel):
    amount: Optional[float] = None
    category: Optional[str] = None
    description: Optional[str] = None

class ExpenseResponse(ExpenseBase):
    id: str
    created_at: datetime
    updated_at: datetime
    
    model_config = ConfigDict(from_attributes=True)
