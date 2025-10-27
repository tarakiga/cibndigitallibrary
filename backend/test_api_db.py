"""
Test API Database Connection
"""

import requests
import json

def test_api_db():
    """Test API database connection"""
    print("Testing API Database Connection")
    print("="*40)
    
    # Test health endpoint
    try:
        response = requests.get("http://localhost:8000/health")
        print(f"Health endpoint: {response.status_code}")
        if response.status_code == 200:
            print(f"Response: {response.json()}")
    except Exception as e:
        print(f"Health endpoint error: {e}")
    
    # Test root endpoint
    try:
        response = requests.get("http://localhost:8000/")
        print(f"Root endpoint: {response.status_code}")
        if response.status_code == 200:
            print(f"Response: {response.json()}")
    except Exception as e:
        print(f"Root endpoint error: {e}")
    
    # Test if we can access the API docs
    try:
        response = requests.get("http://localhost:8000/api/v1/docs")
        print(f"Docs endpoint: {response.status_code}")
    except Exception as e:
        print(f"Docs endpoint error: {e}")
    
    # Test a simple POST to see if the API is working
    try:
        response = requests.post(
            "http://localhost:8000/api/v1/auth/login",
            json={"email": "test@test.com", "password": "test"},
            headers={"Content-Type": "application/json"}
        )
        print(f"Login endpoint: {response.status_code}")
        print(f"Response: {response.text}")
    except Exception as e:
        print(f"Login endpoint error: {e}")

if __name__ == "__main__":
    test_api_db()
