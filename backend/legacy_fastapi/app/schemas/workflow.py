from pydantic import BaseModel
from uuid import UUID
from typing import Any
from datetime import datetime

class WorkflowStepCreate(BaseModel):
    sequence_order: int
    rule_type: str
    rule_config: dict[str, Any]

class WorkflowCreate(BaseModel):
    name: str
    steps: list[WorkflowStepCreate]


class WorkflowStepOut(BaseModel):
    id: UUID
    sequence_order: int
    rule_type: str
    rule_config: dict[str, Any]

    class Config:
        from_attributes = True


class WorkflowOut(BaseModel):
    id: UUID
    tenant_id: UUID
    name: str
    created_at: datetime | None
    steps: list[WorkflowStepOut]

    class Config:
        from_attributes = True
