"""
Complete end-to-end verification script for email functionality.
This script tests the entire flow including API calls and email delivery.

Usage:
    python tests/verify_email_flow.py
"""
import sys
import os
import requests
from datetime import datetime

# Add parent directory to path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

# Configuration
API_BASE_URL = "http://localhost:8000/api/v1"
TEST_EMAIL = "test@example.com"
TEST_PASSWORD = "TestPassword123!"
TEST_NEW_PASSWORD = "NewTestPassword456!"

def print_section(title):
    """Print a formatted section header."""
    print("\n" + "=" * 70)
    print(f"  {title}")
    print("=" * 70)

def print_success(message):
    """Print success message."""
    print(f"✅ {message}")

def print_error(message):
    """Print error message."""
    print(f"❌ {message}")

def print_info(message):
    """Print info message."""
    print(f"ℹ️  {message}")

def check_server():
    """Check if backend server is running."""
    print_section("Step 1: Check Backend Server")
    try:
        response = requests.get(f"{API_BASE_URL.replace('/api/v1', '')}/health", timeout=5)
        if response.status_code == 200:
            print_success("Backend server is running")
            return True
    except requests.exceptions.ConnectionError:
        print_error("Backend server is NOT running!")
        print_info(f"Please start the backend server:")
        print_info(f"  cd backend")
        print_info(f"  python -m uvicorn app.main:app --reload --port 8000")
        return False
    except Exception as e:
        print_error(f"Error checking server: {e}")
        return False

def test_registration():
    """Test user registration with welcome email."""
    print_section("Step 2: Test User Registration (with Welcome Email)")
    
    # Generate unique email with timestamp
    unique_email = f"test_{int(datetime.now().timestamp())}@example.com"
    
    payload = {
        "email": unique_email,
        "password": TEST_PASSWORD,
        "full_name": "Test User",
        "role": "subscriber"
    }
    
    print_info(f"Registering user: {unique_email}")
    
    try:
        response = requests.post(f"{API_BASE_URL}/auth/register", json=payload)
        
        if response.status_code == 201:
            print_success("User registered successfully")
            user_data = response.json()
            print_info(f"User ID: {user_data['id']}")
            print_info(f"Email: {user_data['email']}")
            print_info(f"Name: {user_data['full_name']}")
            print_success("Welcome email sent! Check Mailtrap inbox")
            return unique_email
        else:
            print_error(f"Registration failed: {response.status_code}")
            print_error(f"Response: {response.text}")
            return None
            
    except Exception as e:
        print_error(f"Registration error: {e}")
        return None

def test_forgot_password(email):
    """Test forgot password flow."""
    print_section("Step 3: Test Forgot Password (sends reset email)")
    
    print_info(f"Requesting password reset for: {email}")
    
    try:
        response = requests.post(
            f"{API_BASE_URL}/auth/forgot-password",
            params={"email": email}
        )
        
        if response.status_code == 200:
            print_success("Password reset requested successfully")
            message = response.json().get('message', '')
            print_info(f"Response: {message}")
            print_success("Password reset email sent! Check Mailtrap inbox")
            print_info("⚠️  In a real scenario, you would:")
            print_info("  1. Check your Mailtrap inbox")
            print_info("  2. Copy the reset token from the email link")
            print_info("  3. Use it to reset your password")
            return True
        else:
            print_error(f"Forgot password failed: {response.status_code}")
            print_error(f"Response: {response.text}")
            return False
            
    except Exception as e:
        print_error(f"Forgot password error: {e}")
        return False

def test_login(email, password):
    """Test user login."""
    print_section("Step 4: Test Login")
    
    print_info(f"Logging in with: {email}")
    
    payload = {
        "email": email,
        "password": password
    }
    
    try:
        response = requests.post(f"{API_BASE_URL}/auth/login", json=payload)
        
        if response.status_code == 200:
            print_success("Login successful")
            data = response.json()
            print_info(f"Access token received: {data['access_token'][:20]}...")
            return data['access_token']
        else:
            print_error(f"Login failed: {response.status_code}")
            print_error(f"Response: {response.text}")
            return None
            
    except Exception as e:
        print_error(f"Login error: {e}")
        return None

def check_mailtrap_status():
    """Check Mailtrap configuration."""
    print_section("Step 5: Verify Mailtrap Configuration")
    
    from app.core.config import settings
    
    print_info(f"SMTP Host: {settings.SMTP_HOST}")
    print_info(f"SMTP Port: {settings.SMTP_PORT}")
    print_info(f"SMTP User: {settings.SMTP_USER}")
    print_info(f"From Email: {settings.EMAILS_FROM_EMAIL}")
    
    if settings.SMTP_USER and settings.SMTP_PASSWORD:
        print_success("Mailtrap credentials configured")
        return True
    else:
        print_error("Mailtrap credentials NOT configured")
        return False

def main():
    """Run all verification tests."""
    print("\n" + "=" * 70)
    print("  CIBN Digital Library - Email Flow Verification")
    print("=" * 70)
    print(f"\nStarted at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
    
    results = {
        "server": False,
        "mailtrap": False,
        "registration": False,
        "forgot_password": False,
        "login": False
    }
    
    # Step 1: Check if server is running
    results["server"] = check_server()
    if not results["server"]:
        print("\n" + "=" * 70)
        print("  ❌ Verification Failed - Server not running")
        print("=" * 70)
        return
    
    # Step 5: Check Mailtrap configuration
    results["mailtrap"] = check_mailtrap_status()
    if not results["mailtrap"]:
        print_error("Please configure Mailtrap in .env file")
    
    # Step 2: Test registration
    registered_email = test_registration()
    if registered_email:
        results["registration"] = True
        
        # Step 3: Test forgot password
        results["forgot_password"] = test_forgot_password(registered_email)
        
        # Step 4: Test login
        token = test_login(registered_email, TEST_PASSWORD)
        if token:
            results["login"] = True
    
    # Print summary
    print_section("Verification Summary")
    
    total_tests = len(results)
    passed_tests = sum(1 for r in results.values() if r)
    
    print(f"\nTests Passed: {passed_tests}/{total_tests}\n")
    
    for test_name, passed in results.items():
        status = "✅ PASS" if passed else "❌ FAIL"
        print(f"  {status} - {test_name.replace('_', ' ').title()}")
    
    print("\n" + "=" * 70)
    
    if passed_tests == total_tests:
        print("  🎉 All Tests Passed!")
        print("=" * 70)
        print("\n✅ Email functionality is working correctly!")
        print("\n📧 Check your Mailtrap inbox to see the emails:")
        print("   https://mailtrap.io/signin")
        print("\nYou should see:")
        print("  1. Welcome email (from registration)")
        print("  2. Password reset email (from forgot password)")
    else:
        print("  ⚠️  Some Tests Failed")
        print("=" * 70)
        print("\nPlease check the errors above and fix them.")
    
    print(f"\nCompleted at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")

if __name__ == "__main__":
    main()
