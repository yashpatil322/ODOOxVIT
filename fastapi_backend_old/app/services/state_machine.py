from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from app.models.expense import Expense
from app.models.workflow import WorkflowStep, Workflow, ApprovalLog
from app.models.user import User
import uuid

class StateMachineEngine:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def initialize_workflow(self, expense: Expense, workflow: Workflow | None) -> None:
        """Initialize expense status based on whether a workflow is available."""
        if workflow is None:
            expense.status = "PENDING"
            expense.workflow_id = None
            await self.db.commit()
            return

        expense.workflow_id = workflow.id
        expense.status = "UNDER_REVIEW"
        await self.db.commit()

    async def process_approval(self, expense: Expense, step_id: uuid.UUID, status: str, approver_id: uuid.UUID, comments: str | None = None) -> None:
        if expense.workflow_id is None:
            raise ValueError("Expense is not attached to a workflow")

        step = await self.db.get(WorkflowStep, step_id)
        if not step:
            raise ValueError("Step not found")
        if step.workflow_id != expense.workflow_id:
            raise ValueError("Step does not belong to expense workflow")

        is_allowed = await self._is_approver_allowed(expense=expense, step=step, approver_id=approver_id)
        if not is_allowed:
            raise ValueError("Approver is not allowed for this step")

        # Persist decision for this step.
        log = ApprovalLog(
            expense_id=expense.id,
            step_id=step_id,
            approver_id=approver_id,
            status=status,
            comments=comments,
        )
        self.db.add(log)
        await self.db.commit()

        if status == "REJECTED":
            expense.status = "REJECTED"
            await self.db.commit()
            return

        # Check if current step condition is met
        is_step_complete = False
        if step.rule_type == "SPECIFIC_APPROVER":
            is_step_complete = True
        elif step.rule_type == "MANAGER":
            is_step_complete = True
        elif step.rule_type == "PERCENTAGE_QUORUM":
            count_res = await self.db.execute(
                select(func.count(ApprovalLog.id))
                .where(ApprovalLog.expense_id == expense.id)
                .where(ApprovalLog.step_id == step_id)
                .where(ApprovalLog.status == "APPROVED")
            )
            count = count_res.scalar()
            required = step.rule_config.get("required_count", 1)
            if count >= required:
                is_step_complete = True
        else:
            is_step_complete = True

        if is_step_complete:
            # Find next step
            result = await self.db.execute(
                select(WorkflowStep)
                .where(WorkflowStep.workflow_id == step.workflow_id)
                .where(WorkflowStep.sequence_order > step.sequence_order)
                .order_by(WorkflowStep.sequence_order)
            )
            next_step = result.scalars().first()
            
            if next_step:
                expense.status = "UNDER_REVIEW"
            else:
                expense.status = "APPROVED"
                
            await self.db.commit()

    async def _is_approver_allowed(self, expense: Expense, step: WorkflowStep, approver_id: uuid.UUID) -> bool:
        if step.rule_type == "SPECIFIC_APPROVER":
            required_id = step.rule_config.get("user_id")
            return str(approver_id) == str(required_id)

        if step.rule_type == "MANAGER":
            submitter = await self.db.get(User, expense.user_id)
            if not submitter or not submitter.manager_id:
                return False
            return submitter.manager_id == approver_id

        # For quorum and other custom rule types, allow participant-level checks to happen in step completion logic.
        return True
