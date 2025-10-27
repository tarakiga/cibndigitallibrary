"""
Simple Login Test
Test the exact same authentication flow as the API
"""

import sys
import os
from pathlib import Path

# Add the backend directory to Python path
backend_dir = Path(__file__).parent
sys.path.insert(0, str(backend_dir))
os.environ["PYTHONPATH"] = str(backend_dir)

from sqlalchemy.orm import Session
from app.db.session import SessionLocal, get_db
from app.models.user import User
from app.schemas.user import UserLogin
from app.services.auth import authenticate_user

def test_simple_login():
    """Test simple login"""
    print("Simple Login Test")
    print("="*30)
    
    # Test 1: Direct database access
    print("1. Direct database access:")
    db = SessionLocal()
    user = db.query(User).filter(User.email == "subscriber@test.com").first()
    if user:
        print(f"   User found: {user.email}")
        print(f"   User active: {user.is_active}")
    else:
        print("   User NOT found!")
    db.close()
    
    # Test 2: Using get_db dependency
    print("\n2. Using get_db dependency:")
    db_gen = get_db()
    db = next(db_gen)
    try:
        user = db.query(User).filter(User.email == "subscriber@test.com").first()
        if user:
            print(f"   User found: {user.email}")
            print(f"   User active: {user.is_active}")
        else:
            print("   User NOT found!")
    finally:
        db.close()
    
    # Test 3: Authentication service
    print("\n3. Authentication service:")
    db = SessionLocal()
    try:
        login_data = UserLogin(email="subscriber@test.com", password="password123")
        user, token = authenticate_user(db, login_data)
        print(f"   Authentication successful!")
        print(f"   User: {user.email}")
        print(f"   Token: {token[:50]}...")
    except Exception as e:
        print(f"   Authentication failed: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    test_simple_login()
