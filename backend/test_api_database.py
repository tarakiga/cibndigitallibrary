"""
Test API Database Connection
"""

import requests
import json
import sys
import os
from pathlib import Path

# Add the backend directory to Python path
backend_dir = Path(__file__).parent
sys.path.insert(0, str(backend_dir))
os.environ["PYTHONPATH"] = str(backend_dir)

from app.db.session import SessionLocal
from app.models.user import User

def test_api_database():
    """Test if API is using the same database"""
    
    # First, check our local database
    print("Local Database Check:")
    db = SessionLocal()
    users = db.query(User).all()
    print(f"  Users in local database: {len(users)}")
    for user in users:
        print(f"    - {user.email}")
    db.close()
    
    # Now test the API
    print(f"\nAPI Database Check:")
    try:
        # Test the root endpoint
        response = requests.get("http://localhost:8000/")
        print(f"  Root endpoint: {response.status_code}")
        if response.status_code == 200:
            print(f"  Response: {response.json()}")
        
        # Test health endpoint
        response = requests.get("http://localhost:8000/health")
        print(f"  Health endpoint: {response.status_code}")
        if response.status_code == 200:
            print(f"  Response: {response.json()}")
            
    except Exception as e:
        print(f"  Error: {e}")
    
    # Test if we can access the docs
    try:
        response = requests.get("http://localhost:8000/api/v1/docs")
        print(f"  Docs endpoint: {response.status_code}")
    except Exception as e:
        print(f"  Docs error: {e}")

if __name__ == "__main__":
    print("API Database Connection Test")
    print("="*40)
    test_api_database()
