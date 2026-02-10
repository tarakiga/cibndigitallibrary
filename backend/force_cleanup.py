import sys
import os
from sqlalchemy import text

# Add the parent directory to the path so we can import the app
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.db.session import SessionLocal
from app.models import Content, Purchase, Order, ContentProgress, OrderItem

def force_delete_all_content():
    db = SessionLocal()
    try:
        print("Cleaning up database (test data)...")
        
        # 1. Delete ContentProgress
        deleted_progress = db.query(ContentProgress).delete()
        print(f"Deleted {deleted_progress} ContentProgress records")
        
        # 2. Delete Purchases
        deleted_purchases = db.query(Purchase).delete()
        print(f"Deleted {deleted_purchases} Purchase records")

        # 3. Delete OrderItems
        deleted_order_items = db.query(OrderItem).delete()
        print(f"Deleted {deleted_order_items} OrderItem records")
        
        # 4. Delete Orders
        deleted_orders = db.query(Order).delete()
        print(f"Deleted {deleted_orders} Order records")

        # 5. Delete Content
        deleted_content = db.query(Content).delete()
        print(f"Deleted {deleted_content} Content records")
        
        db.commit()
        print("Successfully cleared all content and related data!")
        
    except Exception as e:
        print(f"Error cleaning up: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    force_delete_all_content()
