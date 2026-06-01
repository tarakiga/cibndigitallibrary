"""Create settings tables

Revision ID: 20260210_add_settings_tables
Revises: 20260210_add_purchase_fields
Create Date: 2026-02-10 06:15:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = '20260210_add_settings_tables'
down_revision: Union[str, None] = '20260210_add_purchase_fields'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    conn = op.get_bind()
    inspector = sa.inspect(conn)
    tables = inspector.get_table_names()

    # Create payment_settings table if it doesn't exist
    if 'payment_settings' not in tables:
        op.create_table('payment_settings',
            sa.Column('id', sa.Integer(), nullable=False),
            sa.Column('active_mode', sa.String(), nullable=False, server_default='test'),
            sa.Column('test_public_key', sa.String(), nullable=True),
            sa.Column('test_secret_key', sa.String(), nullable=True),
            sa.Column('live_public_key', sa.String(), nullable=True),
            sa.Column('live_secret_key', sa.String(), nullable=True),
            sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
            sa.PrimaryKeyConstraint('id')
        )
        op.create_index(op.f('ix_payment_settings_id'), 'payment_settings', ['id'], unique=False)

    # Create email_settings table if it doesn't exist
    if 'email_settings' not in tables:
        op.create_table('email_settings',
            sa.Column('id', sa.Integer(), nullable=False),
            sa.Column('smtp_host', sa.String(), nullable=True),
            sa.Column('smtp_port', sa.Integer(), nullable=True, server_default='587'),
            sa.Column('smtp_user', sa.String(), nullable=True),
            sa.Column('smtp_password', sa.String(), nullable=True),
            sa.Column('smtp_tls', sa.Boolean(), nullable=True, server_default='true'),
            sa.Column('emails_from_email', sa.String(), nullable=True),
            sa.Column('emails_from_name', sa.String(), nullable=True, server_default='CIBN Digital Library'),
            sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
            sa.PrimaryKeyConstraint('id')
        )
        op.create_index(op.f('ix_email_settings_id'), 'email_settings', ['id'], unique=False)


def downgrade() -> None:
    conn = op.get_bind()
    inspector = sa.inspect(conn)
    tables = inspector.get_table_names()

    if 'email_settings' in tables:
        op.drop_index(op.f('ix_email_settings_id'), table_name='email_settings')
        op.drop_table('email_settings')

    if 'payment_settings' in tables:
        op.drop_index(op.f('ix_payment_settings_id'), table_name='payment_settings')
        op.drop_table('payment_settings')
