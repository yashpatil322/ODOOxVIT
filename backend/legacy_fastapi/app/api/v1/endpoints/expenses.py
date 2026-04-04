from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.api import deps
from app.db.database import get_db
from app.models.user import User
from app.models.expense import Expense
from app.models.workflow import Workflow
from app.schemas.expense import ExpenseCreate, ExpenseOut, ExpenseApprove
from app.services.state_machine import StateMachineEngine
import uuid

router = APIRouter()

@router.post("/", response_model=ExpenseOut)
async def create_expense(
    *,
    db: AsyncSession = Depends(get_db),
    expense_in: ExpenseCreate,
    current_user: User = Depends(deps.get_current_user),
):
    workflow_res = await db.execute(
        select(Workflow)
        .where(Workflow.tenant_id == current_user.tenant_id)
        .order_by(Workflow.created_at.asc())
    )
    workflow = workflow_res.scalars().first()

    expense = Expense(
        tenant_id=current_user.tenant_id,
        user_id=current_user.id,
        workflow_id=workflow.id if workflow else None,
        amount=expense_in.amount,
        currency=expense_in.currency.upper(),
        base_amount=expense_in.amount,
        base_currency="USD",
        exchange_rate=1.0,
        status="PENDING",
        receipt_url=expense_in.receipt_url
    )
    db.add(expense)
    await db.commit()
    await db.refresh(expense)
    
    # Trigger StateMachineEngine here to start the workflow
    engine = StateMachineEngine(db)
    await engine.initialize_workflow(expense, workflow)
    
    return expense


@router.get("/{expense_id}", response_model=ExpenseOut)
async def get_expense(
    expense_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(deps.get_current_user),
):
    expense = await db.get(Expense, expense_id)
    if not expense:
        raise HTTPException(status_code=404, detail="Expense not found")
    if expense.tenant_id != current_user.tenant_id:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    return expense

@router.get("/me", response_model=list[ExpenseOut])
async def read_my_expenses(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(deps.get_current_user),
):
    result = await db.execute(
        select(Expense)
        .where(Expense.user_id == current_user.id)
        .order_by(Expense.created_at.desc())
    )
    return result.scalars().all()

@router.post("/{expense_id}/approve")
async def approve_expense(
    *,
    db: AsyncSession = Depends(get_db),
    expense_id: uuid.UUID,
    approval_in: ExpenseApprove,
    current_user: User = Depends(deps.get_current_user),
):
    expense = await db.get(Expense, expense_id)
    if not expense:
        raise HTTPException(status_code=404, detail="Expense not found")
        
    # Tenant boundary check
    if expense.tenant_id != current_user.tenant_id:
        raise HTTPException(status_code=403, detail="Not enough permissions")
        
    engine = StateMachineEngine(db)
    try:
        await engine.process_approval(
            expense=expense,
            step_id=approval_in.step_id,
            status=approval_in.status,
            approver_id=current_user.id,
            comments=approval_in.comments,
        )
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    return {"status": "success", "expense_status": expense.status}
