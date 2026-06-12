from pydantic import BaseModel
from datetime import datetime


class Booking(BaseModel):
    asset_id: str
    user_id: str

    quantity: int

    start_date: datetime
    end_date: datetime

    status: str = "pending"