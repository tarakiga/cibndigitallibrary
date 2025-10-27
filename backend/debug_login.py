"""
Debug Login Script
Debug the login issue by testing the exact same flow as the API
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
from app.schemas.user import UserLogin
from app.services.auth import authenticate_user

def debug_login():
    """Debug the login process"""
    db: Session = SessionLocal()
    
    try:
        print("Debugging login process...")
        
        # Create login data exactly like the API would
        login_data = UserLogin(email="subscriber@test.com", password="password123")
        print(f"Login data: email={login_data.email}, password={login_data.password}")
        
        # Test the exact same flow as the API
        try:
            user, access_token = authenticate_user(db, login_data)
            print(f"SUCCESS: User authenticated!")
            print(f"  User ID: {user.id}")
            print(f"  User Email: {user.email}")
            print(f"  User Role: {user.role}")
            print(f"  Access Token: {access_token[:50]}...")
        except Exception as e:
            print(f"ERROR in authenticate_user: {e}")
            import traceback
            traceback.print_exc()
        
        # Also test direct database query
        print(f"\nDirect database query test:")
        user = db.query(User).filter(User.email == "subscriber@test.com").first()
        if user:
            print(f"  User found: {user.email}")
            print(f"  User active: {user.is_active}")
            print(f"  User verified: {user.is_verified}")
            print(f"  User role: {user.role}")
        else:
            print("  User NOT found in database!")
            
    except Exception as e:
        print(f"Error: {e}")
        import traceback
        traceback.print_exc()
    finally:
        db.close()

if __name__ == "__main__":
    print("Debugging Login Process")
    print("="*40)
    debug_login()
