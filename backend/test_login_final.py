"""
Final Login Test
Test login with exact same format as the frontend would use
"""

import requests
import json

def test_login_final():
    """Final login test"""
    print("Final Login Test")
    print("="*30)
    
    # Test data
    login_data = {
        "email": "subscriber@test.com",
        "password": "password123"
    }
    
    try:
        print(f"Testing login with data: {json.dumps(login_data)}")
        
        # Make the request with proper headers
        response = requests.post(
            "http://localhost:8000/api/v1/auth/login",
            json=login_data,
            headers={
                "Content-Type": "application/json",
                "Accept": "application/json"
            },
            timeout=10
        )
        
        print(f"Response Status: {response.status_code}")
        print(f"Response Headers: {dict(response.headers)}")
        print(f"Response Text: {response.text}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"SUCCESS! Login successful!")
            print(f"Token: {data.get('access_token', 'No token')[:50]}...")
            print(f"User: {data.get('user', {}).get('email', 'No user')}")
        else:
            print(f"FAILED! Login failed with status {response.status_code}")
            
    except requests.exceptions.ConnectionError:
        print("ERROR: Could not connect to the API. Make sure the backend server is running.")
    except Exception as e:
        print(f"ERROR: {e}")

if __name__ == "__main__":
    test_login_final()
