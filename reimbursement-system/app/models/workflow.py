from sqlalchemy import Column, String, Integer, ForeignKey, Uuid, JSON, DateTime
from sqlalchemy.sql import func
import uuid
from app.db.database import Base

class Workflow(Base):
    __tablename__ = "workflows"

    id = Column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    tenant_id = Column(Uuid(as_uuid=True), ForeignKey("tenants.id", ondelete="CASCADE"), nullable=False)
    name = Column(String, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class WorkflowStep(Base):
    __tablename__ = "workflow_steps"

    id = Column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    workflow_id = Column(Uuid(as_uuid=True), ForeignKey("workflows.id", ondelete="CASCADE"), nullable=False)
    sequence_order = Column(Integer, nullable=False)
    rule_type = Column(String, nullable=False)  # MANAGER, SPECIFIC_APPROVER, PERCENTAGE_QUORUM
    rule_config = Column(JSON, nullable=False, default=dict)

class ApprovalLog(Base):
    __tablename__ = "approval_logs"

    id = Column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    expense_id = Column(Uuid(as_uuid=True), ForeignKey("expenses.id", ondelete="CASCADE"), nullable=False)
    step_id = Column(Uuid(as_uuid=True), ForeignKey("workflow_steps.id", ondelete="CASCADE"), nullable=False)
    approver_id = Column(Uuid(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    status = Column(String, nullable=False) # APPROVED, REJECTED
    comments = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
