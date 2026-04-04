from sqlalchemy import Column, String, DateTime, ForeignKey, Numeric, Uuid, JSON
from sqlalchemy.sql import func
import uuid
from app.db.database import Base

class Expense(Base):
    __tablename__ = "expenses"

    id = Column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    tenant_id = Column(Uuid(as_uuid=True), ForeignKey("tenants.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(Uuid(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    workflow_id = Column(Uuid(as_uuid=True), ForeignKey("workflows.id", ondelete="SET NULL"), nullable=True)
    amount = Column(Numeric(10, 2), nullable=False)
    currency = Column(String, nullable=False)
    base_amount = Column(Numeric(10, 2), nullable=False)
    base_currency = Column(String, nullable=False)
    exchange_rate = Column(Numeric(10, 6), nullable=False)
    status = Column(String, nullable=False, default="PENDING")  # PENDING, UNDER_REVIEW, APPROVED, REJECTED
    receipt_url = Column(String, nullable=True)
    ocr_metadata = Column(JSON, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
