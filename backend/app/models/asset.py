from pydantic import BaseModel


class Asset(BaseModel):
    name: str
    category: str
    description: str
    quantity: int
    status: str = "available"