"""Script to clear all content records from the database."""
import sys
import os
from pathlib import Path

# Add the backend directory to Python path
backend_dir = Path(__file__).parent
sys.path.insert(0, str(backend_dir))
os.environ["PYTHONPATH"] = str(backend_dir)

from app.db.session import SessionLocal
from app.models.content import Content
from app.models.order import Purchase, OrderItem, Order

def clear_contents():
    db = SessionLocal()
    try:
        # Delete in order to respect foreign key constraints:
        # 1. Order items (references orders and contents)
        order_items_deleted = db.query(OrderItem).delete()
        print(f'Deleted {order_items_deleted} order item records')
        
        # 2. Orders (can now be deleted)
        orders_deleted = db.query(Order).delete()
        print(f'Deleted {orders_deleted} order records')
        
        # 3. Purchases (references contents)
        purchases_deleted = db.query(Purchase).delete()
        print(f'Deleted {purchases_deleted} purchase records')
        
        # 4. Finally delete all contents
        contents_deleted = db.query(Content).delete()
        print(f'Deleted {contents_deleted} content records')
        
        db.commit()
        print(f'\nSuccessfully cleared all data!')
        print(f'Total records deleted: {order_items_deleted + orders_deleted + purchases_deleted + contents_deleted}')
    except Exception as e:
        db.rollback()
        print(f'Error clearing contents: {e}')
    finally:
        db.close()

if __name__ == '__main__':
    confirm = input('Are you sure you want to delete ALL content records? (yes/no): ')
    if confirm.lower() == 'yes':
        clear_contents()
    else:
        print('Operation cancelled')
