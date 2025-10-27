"""
Test Registration Endpoint
Create a new user through the API registration endpoint
"""

import requests
import json

def test_registration():
    """Test user registration through API"""
    print("Testing User Registration")
    print("="*30)
    
    # Test data for registration
    user_data = {
        "email": "testuser@example.com",
        "password": "testpassword123",
        "full_name": "Test User",
        "phone": "+2348012345678",
        "role": "subscriber"
    }
    
    try:
        print(f"Registering user: {user_data['email']}")
        
        response = requests.post(
            "http://localhost:8000/api/v1/auth/register",
            json=user_data,
            headers={"Content-Type": "application/json"}
        )
        
        print(f"Registration Status: {response.status_code}")
        print(f"Response: {response.text}")
        
        if response.status_code == 201:
            print("✅ User registered successfully!")
            
            # Now test login with the new user
            print("\nTesting login with new user...")
            login_data = {
                "email": "testuser@example.com",
                "password": "testpassword123"
            }
            
            login_response = requests.post(
                "http://localhost:8000/api/v1/auth/login",
                json=login_data,
                headers={"Content-Type": "application/json"}
            )
            
            print(f"Login Status: {login_response.status_code}")
            print(f"Login Response: {login_response.text}")
            
            if login_response.status_code == 200:
                print("✅ Login successful with new user!")
                data = login_response.json()
                print(f"Token: {data.get('access_token', 'No token')[:50]}...")
            else:
                print("❌ Login failed with new user")
        else:
            print("❌ Registration failed")
            
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_registration()
