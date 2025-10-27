"""
Test Database Endpoint
Add a temporary endpoint to test database access
"""

import sys
import os
from pathlib import Path

# Add the backend directory to Python path
backend_dir = Path(__file__).parent
sys.path.insert(0, str(backend_dir))
os.environ["PYTHONPATH"] = str(backend_dir)

from fastapi import FastAPI, Depends
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.user import User

# Create a test app
test_app = FastAPI()

@test_app.get("/test-users")
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

@test_app.post("/test-login")
def test_login(email: str, password: str, db: Session = Depends(get_db)):
    """Test login endpoint"""
    user = db.query(User).filter(User.email == email).first()
    if not user:
        return {"error": "User not found"}
    
    from app.core.security import verify_password
    if not verify_password(password, user.hashed_password):
        return {"error": "Invalid password"}
    
    return {
        "success": True,
        "user": {
            "id": user.id,
            "email": user.email,
            "role": user.role.value
        }
    }

if __name__ == "__main__":
    import uvicorn
    print("Starting test server on port 8001...")
    uvicorn.run(test_app, host="0.0.0.0", port=8001)
