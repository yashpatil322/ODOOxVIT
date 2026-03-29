from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
import uuid
from app.api import deps
from app.db.database import get_db
from app.models.user import User
from app.models.workflow import Workflow, WorkflowStep
from app.schemas.workflow import WorkflowCreate, WorkflowOut, WorkflowStepOut

router = APIRouter()


@router.get("/", response_model=list[WorkflowOut])
async def list_workflows(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(deps.get_current_user),
):
    workflows_res = await db.execute(
        select(Workflow)
        .where(Workflow.tenant_id == current_user.tenant_id)
        .order_by(Workflow.created_at.asc())
    )
    workflows = workflows_res.scalars().all()

    steps_res = await db.execute(
        select(WorkflowStep)
        .where(WorkflowStep.workflow_id.in_([workflow.id for workflow in workflows]))
        .order_by(WorkflowStep.sequence_order.asc())
    ) if workflows else None
    all_steps = steps_res.scalars().all() if steps_res else []

    steps_by_workflow: dict = {}
    for step in all_steps:
        steps_by_workflow.setdefault(step.workflow_id, []).append(step)

    return [
        WorkflowOut(
            id=workflow.id,
            tenant_id=workflow.tenant_id,
            name=workflow.name,
            created_at=workflow.created_at,
            steps=[WorkflowStepOut.model_validate(step) for step in steps_by_workflow.get(workflow.id, [])],
        )
        for workflow in workflows
    ]


@router.get("/{workflow_id}", response_model=WorkflowOut)
async def get_workflow(
    workflow_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(deps.get_current_user),
):
    workflow = await db.get(Workflow, workflow_id)
    if not workflow or workflow.tenant_id != current_user.tenant_id:
        raise HTTPException(status_code=404, detail="Workflow not found")

    steps_res = await db.execute(
        select(WorkflowStep)
        .where(WorkflowStep.workflow_id == workflow.id)
        .order_by(WorkflowStep.sequence_order.asc())
    )
    steps = steps_res.scalars().all()
    return WorkflowOut(
        id=workflow.id,
        tenant_id=workflow.tenant_id,
        name=workflow.name,
        created_at=workflow.created_at,
        steps=[WorkflowStepOut.model_validate(step) for step in steps],
    )

@router.post("/", status_code=201)
async def create_workflow(
    *,
    db: AsyncSession = Depends(get_db),
    workflow_in: WorkflowCreate,
    current_user: User = Depends(deps.get_current_user)
):
    workflow = Workflow(
        tenant_id=current_user.tenant_id,
        name=workflow_in.name
    )
    db.add(workflow)
    await db.commit()
    await db.refresh(workflow)
    
    for step_in in workflow_in.steps:
        step = WorkflowStep(
            workflow_id=workflow.id,
            sequence_order=step_in.sequence_order,
            rule_type=step_in.rule_type,
            rule_config=step_in.rule_config
        )
        db.add(step)
        
    await db.commit()

    steps_res = await db.execute(
        select(WorkflowStep)
        .where(WorkflowStep.workflow_id == workflow.id)
        .order_by(WorkflowStep.sequence_order.asc())
    )
    steps = steps_res.scalars().all()
    return WorkflowOut(
        id=workflow.id,
        tenant_id=workflow.tenant_id,
        name=workflow.name,
        created_at=workflow.created_at,
        steps=[WorkflowStepOut.model_validate(step) for step in steps],
    )
