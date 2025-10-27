"""
Test Login Script
Tests user creation and login functionality
"""

import sys
import os
from pathlib import Path

# Add the backend directory to Python path
backend_dir = Path(__file__).parent
sys.path.insert(0, str(backend_dir))
os.environ["PYTHONPATH"] = str(backend_dir)

from sqlalchemy.orm import Session
from app.db.session import SessionLocal
from app.models.user import User
from app.core.security import get_password_hash, verify_password

def test_user_login():
    """Test user login functionality"""
    db: Session = SessionLocal()
    
    try:
        # Check if users exist
        users = db.query(User).all()
        print(f"Found {len(users)} users in database:")
        
        for user in users:
            print(f"  - {user.email} (Role: {user.role}, Active: {user.is_active})")
        
        # Test password verification for subscriber
        subscriber = db.query(User).filter(User.email == "subscriber@test.com").first()
        
        if subscriber:
            print(f"\nTesting subscriber login:")
            print(f"  Email: {subscriber.email}")
            print(f"  Hashed password: {subscriber.hashed_password[:50]}...")
            
            # Test password verification
            test_password = "password123"
            is_valid = verify_password(test_password, subscriber.hashed_password)
            print(f"  Password 'password123' is valid: {is_valid}")
            
            # Test with wrong password
            wrong_password = "wrongpassword"
            is_invalid = verify_password(wrong_password, subscriber.hashed_password)
            print(f"  Password 'wrongpassword' is valid: {is_invalid}")
            
        else:
            print("\nSubscriber user not found!")
            
        # Test password hashing
        print(f"\nTesting password hashing:")
        test_hash = get_password_hash("password123")
        print(f"  Hash for 'password123': {test_hash[:50]}...")
        
        # Verify the hash
        is_hash_valid = verify_password("password123", test_hash)
        print(f"  Hash verification: {is_hash_valid}")
        
    except Exception as e:
        print(f"Error: {e}")
        import traceback
        traceback.print_exc()
    finally:
        db.close()

if __name__ == "__main__":
    print("Testing User Login Functionality")
    print("="*40)
    test_user_login()
