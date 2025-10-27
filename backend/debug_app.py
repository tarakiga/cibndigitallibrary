"""
Debug App
Create a simple FastAPI app to test the authentication
"""

import sys
import os
from pathlib import Path

# Add the backend directory to Python path
backend_dir = Path(__file__).parent
sys.path.insert(0, str(backend_dir))
os.environ["PYTHONPATH"] = str(backend_dir)

from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.user import User
from app.schemas.user import UserLogin
from app.services.auth import authenticate_user
from app.core.security import verify_password

# Create a simple debug app
debug_app = FastAPI(title="Debug App")

@debug_app.get("/")
def root():
    return {"message": "Debug App Running"}

@debug_app.get("/test-users")
def test_users(db: Session = Depends(get_db)):
    """Test endpoint to check database access"""
    users = db.query(User).all()
    return {
        "count": len(users),
        "users": [
            {
                "id": user.id,
                "email": user.email,
                "role": user.role.value,
                "is_active": user.is_active
            }
            for user in users
        ]
    }

@debug_app.post("/test-login")
def test_login(login_data: UserLogin, db: Session = Depends(get_db)):
    """Test login endpoint"""
    print(f"Login attempt: {login_data.email}")
    
    # Direct user lookup
    user = db.query(User).filter(User.email == login_data.email).first()
    if not user:
        print("User not found in database")
        raise HTTPException(status_code=401, detail="User not found")
    
    print(f"User found: {user.email}, active: {user.is_active}")
    
    # Password verification
    if not verify_password(login_data.password, user.hashed_password):
        print("Password verification failed")
        raise HTTPException(status_code=401, detail="Invalid password")
    
    print("Password verification successful")
    
    return {
        "success": True,
        "user": {
            "id": user.id,
            "email": user.email,
            "role": user.role.value
        }
    }

@debug_app.post("/test-auth-service")
def test_auth_service(login_data: UserLogin, db: Session = Depends(get_db)):
    """Test authentication service"""
    try:
        user, token = authenticate_user(db, login_data)
        return {
            "success": True,
            "user": {
                "id": user.id,
                "email": user.email,
                "role": user.role.value
            },
            "token": token
        }
    except Exception as e:
        print(f"Authentication service error: {e}")
        raise HTTPException(status_code=401, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    print("Starting debug server on port 8002...")
    uvicorn.run(debug_app, host="0.0.0.0", port=8002)
