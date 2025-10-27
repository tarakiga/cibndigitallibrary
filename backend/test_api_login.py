"""
Test API Login Script
Tests the actual API login endpoint
"""

import requests
import json

def test_api_login():
    """Test the API login endpoint"""
    base_url = "http://localhost:8000"
    
    # Test data
    login_data = {
        "email": "subscriber@test.com",
        "password": "password123"
    }
    
    try:
        print("Testing API login endpoint...")
        print(f"URL: {base_url}/api/v1/auth/login")
        print(f"Data: {json.dumps(login_data, indent=2)}")
        
        # Make the request
        response = requests.post(
            f"{base_url}/api/v1/auth/login",
            json=login_data,
            headers={"Content-Type": "application/json"}
        )
        
        print(f"\nResponse Status: {response.status_code}")
        print(f"Response Headers: {dict(response.headers)}")
        
        try:
            response_data = response.json()
            print(f"Response Data: {json.dumps(response_data, indent=2)}")
        except:
            print(f"Response Text: {response.text}")
        
        if response.status_code == 200:
            print("\n✅ Login successful!")
            token = response_data.get("access_token")
            if token:
                print(f"Access Token: {token[:50]}...")
        else:
            print(f"\n❌ Login failed with status {response.status_code}")
            
    except requests.exceptions.ConnectionError:
        print("❌ Could not connect to the API. Make sure the backend server is running.")
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    print("Testing API Login Endpoint")
    print("="*40)
    test_api_login()
