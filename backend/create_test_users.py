"""
Create Test Users Script
Creates test accounts for development and testing
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
from app.models.user import User, UserRole
from app.core.security import get_password_hash

# Create tables
Base.metadata.create_all(bind=engine)

def create_test_users():
    """Create test user accounts"""
    db: Session = SessionLocal()
    
    try:
        # Test users data
        test_users = [
            {
                "email": "subscriber@test.com",
                "password": "password123",
                "full_name": "Test Subscriber",
                "phone": "+2348012345678",
                "role": UserRole.SUBSCRIBER,
                "is_active": True,
                "is_verified": True,
            },
            {
                "email": "cibn@test.com",
                "password": "password123",
                "full_name": "Test CIBN Member",
                "phone": "+2348087654321",
                "role": UserRole.CIBN_MEMBER,
                "cibn_employee_id": "CIBN001",
                "is_active": True,
                "is_verified": True,
            },
            {
                "email": "admin@test.com",
                "password": "admin123",
                "full_name": "Test Admin",
                "phone": "+2348099999999",
                "role": UserRole.ADMIN,
                "is_active": True,
                "is_verified": True,
            },
        ]
        
        created_count = 0
        skipped_count = 0
        
        for user_data in test_users:
            # Check if user already exists
            existing_user = db.query(User).filter(User.email == user_data["email"]).first()
            
            if existing_user:
                print(f"User {user_data['email']} already exists - skipping")
                skipped_count += 1
                continue
            
            # Create new user
            password = user_data.pop("password")
            user = User(
                **user_data,
                hashed_password=get_password_hash(password)
            )
            
            db.add(user)
            created_count += 1
            print(f"Created user: {user_data['email']} ({user_data['role'].value})")
        
        db.commit()
        
        print(f"\nSummary:")
        print(f"   Created: {created_count} users")
        print(f"   Skipped: {skipped_count} users (already exist)")
        print(f"   Total: {created_count + skipped_count} users processed")
        
        if created_count > 0:
            print("\nTest users created successfully!")
            print_test_credentials()
        else:
            print("\nAll test users already exist in database")
            print_test_credentials()
            
    except Exception as e:
        print(f"\nError creating test users: {e}")
        db.rollback()
        raise
    finally:
        db.close()


def print_test_credentials():
    """Print test user credentials"""
    print("\n" + "="*60)
    print("TEST USER CREDENTIALS")
    print("="*60)
    print("\n1. SUBSCRIBER ACCOUNT (General User)")
    print("   Email:    subscriber@test.com")
    print("   Password: password123")
    print("   Role:     Subscriber")
    print("   Access:   Public content only")
    
    print("\n2. CIBN MEMBER ACCOUNT (Exclusive Access)")
    print("   Email:    cibn@test.com")
    print("   Password: password123")
    print("   Role:     CIBN Member")
    print("   Access:   All content including exclusive CIBN materials")
    
    print("\n3. ADMIN ACCOUNT (Full Access)")
    print("   Email:    admin@test.com")
    print("   Password: admin123")
    print("   Role:     Administrator")
    print("   Access:   Full system access")
    
    print("\n" + "="*60)
    print("You can now use these credentials to login to the application!")
    print("="*60)


if __name__ == "__main__":
    print("CIBN Library - Create Test Users")
    print("="*40)
    create_test_users()
