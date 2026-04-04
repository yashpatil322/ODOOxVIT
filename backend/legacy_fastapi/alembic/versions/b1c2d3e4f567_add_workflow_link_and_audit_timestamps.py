"""Add workflow link and audit timestamps

Revision ID: b1c2d3e4f567
Revises: a0fc15e77235
Create Date: 2026-03-29 13:10:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "b1c2d3e4f567"
down_revision: Union[str, Sequence[str], None] = "a0fc15e77235"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    with op.batch_alter_table("workflows", schema=None) as batch_op:
        batch_op.add_column(
            sa.Column(
                "created_at",
                sa.DateTime(timezone=True),
                server_default=sa.text("(CURRENT_TIMESTAMP)"),
                nullable=True,
            )
        )

    with op.batch_alter_table("approval_logs", schema=None) as batch_op:
        batch_op.add_column(
            sa.Column(
                "created_at",
                sa.DateTime(timezone=True),
                server_default=sa.text("(CURRENT_TIMESTAMP)"),
                nullable=True,
            )
        )

    with op.batch_alter_table("expenses", schema=None) as batch_op:
        batch_op.add_column(sa.Column("workflow_id", sa.Uuid(), nullable=True))
        batch_op.create_foreign_key(
            "fk_expenses_workflow_id_workflows",
            "workflows",
            ["workflow_id"],
            ["id"],
            ondelete="SET NULL",
        )


def downgrade() -> None:
    """Downgrade schema."""
    with op.batch_alter_table("expenses", schema=None) as batch_op:
        batch_op.drop_constraint("fk_expenses_workflow_id_workflows", type_="foreignkey")
        batch_op.drop_column("workflow_id")

    with op.batch_alter_table("approval_logs", schema=None) as batch_op:
        batch_op.drop_column("created_at")

    with op.batch_alter_table("workflows", schema=None) as batch_op:
        batch_op.drop_column("created_at")
