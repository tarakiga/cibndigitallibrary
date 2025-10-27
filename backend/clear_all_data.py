#!/usr/bin/env python3
"""Clear all content and related data from the database"""

from app.db.session import engine
from sqlalchemy import text

try:
    with engine.begin() as conn:
        # Delete in correct order to avoid foreign key violations
        conn.execute(text('DELETE FROM order_items'))
        conn.execute(text('DELETE FROM purchases'))
        conn.execute(text('DELETE FROM orders'))
        conn.execute(text('DELETE FROM contents'))
        print('✅ Successfully cleared database - deleted all content and related records')
except Exception as e:
    print(f'❌ Error clearing database: {e}')
