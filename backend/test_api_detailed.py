"""
Test API with Detailed Debugging
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

def test_api_with_debug():
    """Test API with detailed debugging"""
    base_url = "http://localhost:8000"
    
    # Test multiple endpoints
    endpoints = [
        "/health",
        "/api/v1/auth/login",
        "/api/v1/docs"
    ]
    
    for endpoint in endpoints:
        try:
            print(f"\nTesting {endpoint}...")
            response = requests.get(f"{base_url}{endpoint}")
            print(f"  Status: {response.status_code}")
            if response.status_code == 200:
                print(f"  Response: {response.text[:100]}...")
            else:
                print(f"  Error: {response.text}")
        except Exception as e:
            print(f"  Error: {e}")
    
    # Test login with detailed debugging
    print(f"\nDetailed login test:")
    login_data = {
        "email": "subscriber@test.com",
        "password": "password123"
    }
    
    try:
        response = requests.post(
            f"{base_url}/api/v1/auth/login",
            json=login_data,
            headers={"Content-Type": "application/json"},
            timeout=10
        )
        
        print(f"  Status Code: {response.status_code}")
        print(f"  Headers: {dict(response.headers)}")
        print(f"  Response: {response.text}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"  Success! Token: {data.get('access_token', 'No token')[:50]}...")
        
    except Exception as e:
        print(f"  Error: {e}")

if __name__ == "__main__":
    print("Detailed API Testing")
    print("="*40)
    test_api_with_debug()
