"""Add order_id to purchases

Revision ID: 5aadde01fa78
Revises: 5aadde01fa77
Create Date: 2026-02-10 05:55:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '5aadde01fa78'
down_revision: Union[str, None] = '5aadde01fa77'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Add order_id separately first as nullable
    op.add_column('purchases', sa.Column('order_id', sa.Integer(), nullable=True))
    op.create_foreign_key('purchases_order_id_fkey', 'purchases', 'orders', ['order_id'], ['id'])
    
    # Add other missing columns if they are missing (based on model definition)
    # The user logs only complained about order_id for now, but Purchase model also has amount, quantity
    op.add_column('purchases', sa.Column('amount', sa.Float(), nullable=True))
    op.add_column('purchases', sa.Column('quantity', sa.Integer(), server_default='1', nullable=True))


def downgrade() -> None:
    op.drop_column('purchases', 'quantity')
    op.drop_column('purchases', 'amount')
    op.drop_constraint('purchases_order_id_fkey', 'purchases', type_='foreignkey')
    op.drop_column('purchases', 'order_id')
