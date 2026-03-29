from pydantic import BaseModel, EmailStr
from uuid import UUID
from datetime import datetime

class UserBase(BaseModel):
    name: str
    email: EmailStr

class UserCreate(UserBase):
    password: str
    role_id: UUID
    manager_id: UUID | None = None

class UserOut(UserBase):
    id: UUID
    tenant_id: UUID
    role_id: UUID
    manager_id: UUID | None
    created_at: datetime

    class Config:
        from_attributes = True
