"""
Check Database Script
Check which database the API is actually using
"""

import sys
import os
from pathlib import Path

# Add the backend directory to Python path
backend_dir = Path(__file__).parent
sys.path.insert(0, str(backend_dir))
os.environ["PYTHONPATH"] = str(backend_dir)

from app.core.config import settings
from app.db.session import SessionLocal, engine
from app.models.user import User

def check_database():
    """Check which database is being used"""
    print("Database Configuration Check")
    print("="*40)
    
    print(f"Database URL: {settings.DATABASE_URL}")
    print(f"Engine URL: {engine.url}")
    
    # Try to connect and check users
    try:
        db = SessionLocal()
        users = db.query(User).all()
        print(f"\nUsers found in database: {len(users)}")
        for user in users:
            print(f"  - {user.email} (Role: {user.role})")
        db.close()
    except Exception as e:
        print(f"\nError connecting to database: {e}")
        print("This suggests the database is not accessible or not set up properly.")

if __name__ == "__main__":
    check_database()
