"""
Seed Test Users Script
Creates test accounts for development and testing
"""

from sqlalchemy.orm import Session
from app.db.session import SessionLocal, engine, Base
from app.models.user import User, UserRole
from app.core.security import get_password_hash
from datetime import datetime

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
            # Additional test users
            {
                "email": "john.doe@cibn.org",
                "password": "cibn2024",
                "full_name": "John Doe",
                "phone": "+2348011111111",
                "role": UserRole.CIBN_MEMBER,
                "cibn_employee_id": "CIBN002",
                "is_active": True,
                "is_verified": True,
            },
            {
                "email": "jane.smith@example.com",
                "password": "jane2024",
                "full_name": "Jane Smith",
                "phone": "+2348022222222",
                "role": UserRole.SUBSCRIBER,
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
                print(f"⚠️  User {user_data['email']} already exists - skipping")
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
            print(f"[OK] Created user: {user_data['email']} ({user_data['role'].value})")
        
        db.commit()
        
        print(f"\n[SUMMARY]:")
        print(f"   Created: {created_count} users")
        print(f"   Skipped: {skipped_count} users (already exist)")
        print(f"   Total: {created_count + skipped_count} users processed")
        
        if created_count > 0:
            print("\n[SUCCESS] Test users created successfully!")
            print_test_credentials()
        else:
            print("\n[OK] All test users already exist in database")
            print_test_credentials()
            
    except Exception as e:
        print(f"\n[ERROR] Error creating test users: {e}")
        db.rollback()
        raise
    finally:
        db.close()


def print_test_credentials():
    """Print test user credentials"""
    print("\n" + "="*60)
    print("TEST USER CREDENTIALS")
    print("="*60)
    
    print("\n1. SUBSCRIBER ACCOUNT")
    print("   Email:    subscriber@test.com")
    print("   Password: password123")
    print("   Role:     Subscriber (General User)")
    
    print("\n2. CIBN MEMBER ACCOUNT")
    print("   Email:    cibn@test.com")
    print("   Password: password123")
    print("   OR")
    print("   Employee ID: CIBN001")
    print("   Password:    password123")
    print("   Role:        CIBN Member (Access to exclusive content)")
    
    print("\n3. ADMIN ACCOUNT")
    print("   Email:    admin@test.com")
    print("   Password: admin123")
    print("   Role:     Administrator (Full access)")
    
    print("\n4. ADDITIONAL TEST USERS")
    print("   Email:    john.doe@cibn.org")
    print("   Password: cibn2024")
    print("   Role:     CIBN Member")
    print("   ")
    print("   Email:    jane.smith@example.com")
    print("   Password: jane2024")
    print("   Role:     Subscriber")
    
    print("\n" + "="*60)
    print("💡 Use these credentials to test login on frontend")
    print("="*60 + "\n")


def list_all_users():
    """List all users in database"""
    db: Session = SessionLocal()
    
    try:
        users = db.query(User).all()
        
        if not users:
            print("\n📭 No users found in database")
            return
        
        print(f"\n👥 USERS IN DATABASE ({len(users)} total)")
        print("="*60)
        
        for user in users:
            print(f"\n{user.email}")
            print(f"   Name: {user.full_name}")
            print(f"   Role: {user.role.value}")
            if user.cibn_employee_id:
                print(f"   Employee ID: {user.cibn_employee_id}")
            print(f"   Active: {user.is_active}")
            print(f"   Verified: {user.is_verified}")
            
        print("\n" + "="*60 + "\n")
        
    except Exception as e:
        print(f"❌ Error listing users: {e}")
    finally:
        db.close()


if __name__ == "__main__":
    print("\nCIBN Library - Seed Test Users")
    print("="*60 + "\n")
    
    import sys
    
    if len(sys.argv) > 1 and sys.argv[1] == "--list":
        list_all_users()
    else:
        create_test_users()
