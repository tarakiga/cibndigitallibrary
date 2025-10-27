"""
Fix Database Configuration
Ensure the database is properly configured for the API
"""

import sys
import os
from pathlib import Path

# Add the backend directory to Python path
backend_dir = Path(__file__).parent
sys.path.insert(0, str(backend_dir))
os.environ["PYTHONPATH"] = str(backend_dir)

from sqlalchemy.orm import Session
from app.db.session import SessionLocal, engine, Base
from app.models.user import User
from app.core.security import get_password_hash

def fix_database():
    """Fix database configuration"""
    print("Fixing Database Configuration")
    print("="*40)
    
    # Ensure tables exist
    Base.metadata.create_all(bind=engine)
    print("Database tables created/verified")
    
    # Check current users
    db = SessionLocal()
    try:
        users = db.query(User).all()
        print(f"Current users in database: {len(users)}")
        
        if len(users) == 0:
            print("No users found, creating test users...")
            create_test_users(db)
        else:
            print("Users found:")
            for user in users:
                print(f"  - {user.email} (Role: {user.role.value})")
                
    finally:
        db.close()

def create_test_users(db: Session):
    """Create test users"""
    test_users = [
        {
            "email": "subscriber@test.com",
            "password": "password123",
            "full_name": "Test Subscriber",
            "phone": "+2348012345678",
            "role": "subscriber",
            "is_active": True,
            "is_verified": True,
        },
        {
            "email": "cibn@test.com",
            "password": "password123",
            "full_name": "Test CIBN Member",
            "phone": "+2348087654321",
            "role": "cibn_member",
            "cibn_employee_id": "CIBN001",
            "is_active": True,
            "is_verified": True,
        },
        {
            "email": "admin@test.com",
            "password": "admin123",
            "full_name": "Test Admin",
            "phone": "+2348099999999",
            "role": "admin",
            "is_active": True,
            "is_verified": True,
        },
    ]
    
    for user_data in test_users:
        password = user_data.pop("password")
        user = User(
            **user_data,
            hashed_password=get_password_hash(password)
        )
        db.add(user)
        print(f"Created user: {user_data['email']}")
    
    db.commit()
    print("Test users created successfully!")

if __name__ == "__main__":
    fix_database()
