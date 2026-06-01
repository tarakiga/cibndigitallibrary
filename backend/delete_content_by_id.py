import sys
import os
from sqlalchemy import text

# Add the parent directory to the path so we can import the app
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.db.session import SessionLocal
from app.models import Content, Purchase, OrderItem, ContentProgress

def delete_content_by_id(content_id):
    db = SessionLocal()
    try:
        print(f"Attempting to delete Content ID: {content_id}")
        
        content = db.query(Content).filter(Content.id == content_id).first()
        if not content:
            print(f"Content with ID {content_id} not found.")
            return

        # 1. Delete associated ContentProgress
        deleted_progress = db.query(ContentProgress).filter(ContentProgress.content_id == content_id).delete()
        print(f"Deleted {deleted_progress} ContentProgress records")
        
        # 2. Delete associated Purchases
        deleted_purchases = db.query(Purchase).filter(Purchase.content_id == content_id).delete()
        print(f"Deleted {deleted_purchases} Purchase records")

        # 3. Delete associated OrderItems
        deleted_order_items = db.query(OrderItem).filter(OrderItem.content_id == content_id).delete()
        print(f"Deleted {deleted_order_items} OrderItem records")
        
        # 4. Delete the Content itself
        db.delete(content)
        
        db.commit()
        print(f"Successfully deleted Content ID {content_id} and all related records!")
        
    except Exception as e:
        print(f"Error deleting content: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python delete_content_by_id.py <content_id>")
    else:
        try:
            content_id = int(sys.argv[1])
            delete_content_by_id(content_id)
        except ValueError:
            print("Error: Content ID must be an integer.")
