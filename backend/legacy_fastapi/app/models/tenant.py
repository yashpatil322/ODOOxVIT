from sqlalchemy import Column, String, DateTime, Uuid
from sqlalchemy.sql import func
import uuid
from app.db.database import Base

class Tenant(Base):
    __tablename__ = "tenants"

    id = Column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String, nullable=False)
    base_currency = Column(String, nullable=False, default="USD")
    created_at = Column(DateTime(timezone=True), server_default=func.now())
