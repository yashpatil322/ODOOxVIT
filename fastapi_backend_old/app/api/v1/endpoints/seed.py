from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
import hashlib
from app.db.database import get_db
from app.models.tenant import Tenant
from app.models.role import Role
from app.models.user import User
from app.models.workflow import Workflow, WorkflowStep

router = APIRouter()


def _hash_password(raw_password: str) -> str:
    digest = hashlib.pbkdf2_hmac("sha256", raw_password.encode("utf-8"), b"seed_salt", 120000)
    return digest.hex()

@router.post("/", status_code=201)
async def seed_database(db: AsyncSession = Depends(get_db)):
    existing_employee_res = await db.execute(select(User).where(User.email == "bob@acme.com"))
    existing_employee = existing_employee_res.scalar_one_or_none()
    if existing_employee:
        manager_res = await db.execute(
            select(User).where(
                User.tenant_id == existing_employee.tenant_id,
                User.email == "alice@acme.com",
            )
        )
        admin_res = await db.execute(
            select(User).where(
                User.tenant_id == existing_employee.tenant_id,
                User.email == "admin@acme.com",
            )
        )
        manager = manager_res.scalar_one_or_none()
        admin = admin_res.scalar_one_or_none()

        workflow_res = await db.execute(
            select(Workflow)
            .where(Workflow.tenant_id == existing_employee.tenant_id)
            .order_by(Workflow.created_at.asc())
        )
        workflow = workflow_res.scalars().first()
        return {
            "message": "Database already seeded.",
            "tenant_id": str(existing_employee.tenant_id),
            "employee_user_id": str(existing_employee.id),
            "manager_user_id": str(manager.id) if manager else None,
            "admin_user_id": str(admin.id) if admin else None,
            "workflow_id": str(workflow.id) if workflow else None,
            "instructions": f"Pass x-user-id: {existing_employee.id} in headers to act as the Employee.",
        }

    # Create Tenant
    tenant = Tenant(name="Acme Corp", base_currency="USD")
    db.add(tenant)
    await db.commit()
    await db.refresh(tenant)

    # Create Roles
    admin_role = Role(tenant_id=tenant.id, name="Admin", permissions={"all": True})
    manager_role = Role(tenant_id=tenant.id, name="Manager", permissions={"approve": True})
    employee_role = Role(tenant_id=tenant.id, name="Employee", permissions={"submit": True})
    
    db.add_all([admin_role, manager_role, employee_role])
    await db.commit()
    await db.refresh(admin_role)
    await db.refresh(manager_role)
    await db.refresh(employee_role)

    # Create Users
    manager = User(
        tenant_id=tenant.id,
        name="Alice Manager",
        email="alice@acme.com",
        hashed_password=_hash_password("Manager@123"),
        role_id=manager_role.id
    )
    
    admin = User(
        tenant_id=tenant.id,
        name="Admin Boss",
        email="admin@acme.com",
        hashed_password=_hash_password("Admin@123"),
        role_id=admin_role.id
    )
    
    db.add_all([manager, admin])
    await db.commit()
    await db.refresh(manager)
    await db.refresh(admin)

    employee = User(
        tenant_id=tenant.id,
        name="Bob Employee",
        email="bob@acme.com",
        hashed_password=_hash_password("Employee@123"),
        role_id=employee_role.id,
        manager_id=manager.id
    )
    db.add(employee)
    await db.commit()
    await db.refresh(employee)

    # Create Workflow
    workflow = Workflow(tenant_id=tenant.id, name="Standard Expense Approval")
    db.add(workflow)
    await db.commit()
    await db.refresh(workflow)
    
    # Create Workflow Steps
    step1 = WorkflowStep(
        workflow_id=workflow.id,
        sequence_order=1,
        rule_type="MANAGER",
        rule_config={}
    )
    step2 = WorkflowStep(
        workflow_id=workflow.id,
        sequence_order=2,
        rule_type="SPECIFIC_APPROVER",
        rule_config={"user_id": str(admin.id)}
    )
    db.add_all([step1, step2])
    await db.commit()

    return {
        "message": "Database seeded successfully!",
        "tenant_id": str(tenant.id),
        "employee_user_id": str(employee.id),
        "manager_user_id": str(manager.id),
        "admin_user_id": str(admin.id),
        "workflow_id": str(workflow.id),
        "instructions": f"Pass x-user-id: {employee.id} in headers to act as the Employee."
    }
