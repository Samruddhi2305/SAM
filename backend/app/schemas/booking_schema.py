from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class BookingCreate(BaseModel):
    asset_id: str
    quantity: int
    start_date: datetime
    end_date: datetime

class BookingStatusUpdate(BaseModel):
    status: str # approved, rejected, issued, returned
    notes: Optional[str] = None

class BookingOut(BaseModel):
    id: str
    asset_id: str
    asset_name: str
    user_email: str
    quantity: int
    start_date: datetime
    end_date: datetime
    status: str
    notes: Optional[str] = None