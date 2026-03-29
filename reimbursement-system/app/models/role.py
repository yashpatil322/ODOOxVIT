from sqlalchemy import Column, String, ForeignKey, Uuid, JSON
import uuid
from app.db.database import Base

class Role(Base):
    __tablename__ = "roles"

    id = Column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    tenant_id = Column(Uuid(as_uuid=True), ForeignKey("tenants.id", ondelete="CASCADE"), nullable=False)
    name = Column(String, nullable=False)
    permissions = Column(JSON, nullable=False, default=dict)
