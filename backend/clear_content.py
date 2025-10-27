#!/usr/bin/env python3
"""Clear all content from the database"""

import sys
import os

# Add the backend directory to the path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

try:
    from database import SessionLocal, engine
    from models import Content
    
    # Create session
    db = SessionLocal()
    
    try:
        # Delete all content
        deleted_count = db.query(Content).delete()
        db.commit()
        print(f"✅ Successfully deleted {deleted_count} content items from the database")
    except Exception as e:
        db.rollback()
        print(f"❌ Error deleting content: {e}")
    finally:
        db.close()
        
except ImportError as e:
    print(f"❌ Import error: {e}")
    print("Make sure you're running this from the backend directory")
