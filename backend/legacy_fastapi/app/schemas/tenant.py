from pydantic import BaseModel
from uuid import UUID
from datetime import datetime

class TenantBase(BaseModel):
    name: str
    base_currency: str = "USD"

class TenantCreate(TenantBase):
    pass

class TenantOut(TenantBase):
    id: UUID
    created_at: datetime
    
    class Config:
        from_attributes = True
