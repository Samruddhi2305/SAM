from pydantic import BaseModel
from typing import Optional, List, Dict, Any

class MaintenanceLog(BaseModel):
    date: str
    action: str
    cost: float
    performed_by: str

class AssetCreate(BaseModel):
    name: str
    category: str
    description: str
    quantity: int
    status: Optional[str] = "Available" # Available, Maintenance, Damaged
    condition: Optional[str] = "Good"   # Good, Fair, Poor
    image_url: Optional[str] = ""

class AssetUpdate(BaseModel):
    name: Optional[str] = None
    category: Optional[str] = None
    description: Optional[str] = None
    quantity: Optional[int] = None
    status: Optional[str] = None
    condition: Optional[str] = None
    image_url: Optional[str] = None

class AssetMaintenance(BaseModel):
    action: str
    cost: float
    performed_by: str

class AssetOut(BaseModel):
    id: str
    name: str
    category: str
    description: str
    quantity: int
    status: str
    condition: str
    image_url: Optional[str] = ""
    maintenance_history: Optional[List[Dict[str, Any]]] = []