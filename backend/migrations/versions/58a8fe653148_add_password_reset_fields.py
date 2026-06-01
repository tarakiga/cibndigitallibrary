"""add_password_reset_fields

Revision ID: 58a8fe653148
Revises: 
Create Date: 2025-11-12 13:45:37.456809

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '58a8fe653148'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Add password reset fields to users table
    conn = op.get_bind()
    inspector = sa.inspect(conn)
    columns = [c['name'] for c in inspector.get_columns('users')]
    
    if 'reset_token' not in columns:
        op.add_column('users', sa.Column('reset_token', sa.String(), nullable=True))
        
    if 'reset_token_expires' not in columns:
        op.add_column('users', sa.Column('reset_token_expires', sa.DateTime(timezone=True), nullable=True))
        
    # Check for index existence before creating
    indexes = [i['name'] for i in inspector.get_indexes('users')]
    if 'ix_users_reset_token' not in indexes:
        op.create_index(op.f('ix_users_reset_token'), 'users', ['reset_token'], unique=False)


def downgrade() -> None:
    # Remove password reset fields
    op.drop_index(op.f('ix_users_reset_token'), table_name='users')
    op.drop_column('users', 'reset_token_expires')
    op.drop_column('users', 'reset_token')
