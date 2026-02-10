"""add missing purchase fields

Revision ID: 20260210_add_purchase_fields
Revises: 5aadde01fa77
Create Date: 2026-02-10
"""

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = "20260210_add_purchase_fields"
down_revision = "5aadde01fa77"
branch_labels = None
depends_on = None


def upgrade() -> None:
    with op.batch_alter_table("purchases") as batch_op:
        batch_op.add_column(sa.Column("order_id", sa.Integer(), nullable=True))
        batch_op.add_column(sa.Column("amount", sa.Float(), nullable=True))
        batch_op.add_column(sa.Column("quantity", sa.Integer(), nullable=True, server_default="1"))
        batch_op.create_foreign_key(
            "purchases_order_id_fkey", "orders", ["order_id"], ["id"]
        )


def downgrade() -> None:
    with op.batch_alter_table("purchases") as batch_op:
        batch_op.drop_constraint("purchases_order_id_fkey", type_="foreignkey")
        batch_op.drop_column("quantity")
        batch_op.drop_column("amount")
        batch_op.drop_column("order_id")
