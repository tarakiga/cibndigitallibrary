"""
Manual test script to verify email delivery with real SMTP credentials.

Usage:
    python tests/manual_email_test.py

Make sure to update .env with real SMTP credentials before running this test.
"""
import sys
import os

# Add parent directory to path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app.services.email import send_password_reset_email, send_welcome_email
from app.core.config import settings


def test_smtp_connection():
    """Test SMTP connection with configured credentials."""
    print("=" * 60)
    print("SMTP Configuration Test")
    print("=" * 60)
    
    print(f"\nSMTP Host: {settings.SMTP_HOST}")
    print(f"SMTP Port: {settings.SMTP_PORT}")
    print(f"SMTP TLS: {settings.SMTP_TLS}")
    print(f"SMTP User: {settings.SMTP_USER}")
    print(f"From Email: {settings.EMAILS_FROM_EMAIL}")
    print(f"From Name: {settings.EMAILS_FROM_NAME}")
    
    # Check if credentials are configured
    if not settings.SMTP_USER or settings.SMTP_USER == "your-email@gmail.com":
        print("\n❌ ERROR: SMTP credentials not configured!")
        print("\nPlease update the following in your .env file:")
        print("  SMTP_USER=your-actual-email@gmail.com")
        print("  SMTP_PASSWORD=your-app-specific-password")
        print("\nFor Gmail, you need to:")
        print("  1. Enable 2-factor authentication")
        print("  2. Generate an app-specific password")
        print("  3. Use that password in SMTP_PASSWORD")
        return False
    
    if not settings.SMTP_PASSWORD or settings.SMTP_PASSWORD == "your-email-password":
        print("\n❌ ERROR: SMTP password not configured!")
        print("\nPlease set SMTP_PASSWORD in your .env file")
        return False
    
    print("\n✅ SMTP credentials are configured")
    return True


def test_welcome_email():
    """Test sending welcome email."""
    print("\n" + "=" * 60)
    print("Welcome Email Test")
    print("=" * 60)
    
    test_email = input("\nEnter test email address: ").strip()
    if not test_email:
        print("❌ No email provided, skipping test")
        return False
    
    print(f"\nSending welcome email to: {test_email}")
    
    try:
        result = send_welcome_email(
            email_to=test_email,
            user_name="Test User"
        )
        
        if result:
            print(f"✅ Welcome email sent successfully to {test_email}")
            print("   Please check your inbox (and spam folder)")
            return True
        else:
            print("❌ Failed to send welcome email")
            return False
            
    except Exception as e:
        print(f"❌ Error sending welcome email: {e}")
        return False


def test_password_reset_email():
    """Test sending password reset email."""
    print("\n" + "=" * 60)
    print("Password Reset Email Test")
    print("=" * 60)
    
    test_email = input("\nEnter test email address: ").strip()
    if not test_email:
        print("❌ No email provided, skipping test")
        return False
    
    print(f"\nSending password reset email to: {test_email}")
    
    try:
        result = send_password_reset_email(
            email_to=test_email,
            reset_token="test_token_123456",
            user_name="Test User"
        )
        
        if result:
            print(f"✅ Password reset email sent successfully to {test_email}")
            print("   Please check your inbox (and spam folder)")
            print(f"   Reset link: {settings.FRONTEND_URL}/reset-password?token=test_token_123456")
            return True
        else:
            print("❌ Failed to send password reset email")
            return False
            
    except Exception as e:
        print(f"❌ Error sending password reset email: {e}")
        return False


def main():
    """Run all email tests."""
    print("\n" + "=" * 60)
    print("CIBN Digital Library - Email Delivery Test")
    print("=" * 60)
    
    # Test SMTP connection
    if not test_smtp_connection():
        print("\n❌ SMTP configuration test failed")
        print("Please configure SMTP settings in .env before continuing")
        return
    
    # Ask user what to test
    print("\n" + "=" * 60)
    print("Select test to run:")
    print("=" * 60)
    print("1. Test Welcome Email")
    print("2. Test Password Reset Email")
    print("3. Test Both")
    print("4. Exit")
    
    choice = input("\nEnter choice (1-4): ").strip()
    
    if choice == "1":
        test_welcome_email()
    elif choice == "2":
        test_password_reset_email()
    elif choice == "3":
        test_welcome_email()
        test_password_reset_email()
    elif choice == "4":
        print("\nExiting...")
        return
    else:
        print("\n❌ Invalid choice")
        return
    
    print("\n" + "=" * 60)
    print("Email Delivery Test Complete")
    print("=" * 60)


if __name__ == "__main__":
    main()
