from pydantic import BaseModel, Field
from uuid import UUID
from datetime import datetime
from decimal import Decimal
from typing import Literal

class ExpenseCreate(BaseModel):
    amount: Decimal = Field(..., gt=0)
    currency: str = Field(..., min_length=3, max_length=3)
    receipt_url: str | None = None

class ExpenseOut(BaseModel):
    id: UUID
    tenant_id: UUID
    user_id: UUID
    workflow_id: UUID | None
    amount: Decimal
    currency: str
    base_amount: Decimal
    base_currency: str
    exchange_rate: Decimal
    status: str
    receipt_url: str | None
    created_at: datetime
    
    class Config:
        from_attributes = True

class ExpenseApprove(BaseModel):
    step_id: UUID
    status: Literal["APPROVED", "REJECTED"]
    comments: str | None = None
