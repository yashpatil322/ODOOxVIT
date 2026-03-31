from pydantic import BaseModel
from uuid import UUID
from typing import Any

class RoleBase(BaseModel):
    name: str
    permissions: dict[str, Any]

class RoleCreate(RoleBase):
    tenant_id: UUID

class RoleOut(RoleBase):
    id: UUID
    tenant_id: UUID
    
    class Config:
        from_attributes = True
