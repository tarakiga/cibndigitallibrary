"""
Tests for password reset functionality and email delivery.
"""
import pytest
from fastapi.testclient import TestClient
from unittest.mock import patch, MagicMock
from datetime import datetime, timedelta

from app.models import User


@pytest.mark.auth
@pytest.mark.integration
class TestForgotPassword:
    """Tests for forgot password endpoint."""
    
    def test_forgot_password_existing_user(self, client: TestClient, test_user, db):
        """Test forgot password with existing user email."""
        with patch('app.services.email.send_email') as mock_send:
            mock_send.return_value = True
            
            response = client.post(
                "/api/v1/auth/forgot-password",
                params={"email": test_user.email}
            )
            
            assert response.status_code == 200
            assert "email exists" in response.json()["message"].lower()
            
            # Verify reset token was created
            db.refresh(test_user)
            assert test_user.reset_token is not None
            assert test_user.reset_token_expires is not None
            assert test_user.reset_token_expires > datetime.utcnow()
            
            # Verify email was sent
            assert mock_send.called
            call_args = mock_send.call_args
            assert test_user.email in str(call_args)
    
    def test_forgot_password_nonexistent_user(self, client: TestClient):
        """Test forgot password with nonexistent email (should still return success)."""
        with patch('app.services.email.send_email') as mock_send:
            response = client.post(
                "/api/v1/auth/forgot-password",
                params={"email": "nonexistent@example.com"}
            )
            
            # Should return success to prevent email enumeration
            assert response.status_code == 200
            
            # Email should not be sent
            assert not mock_send.called
    
    def test_forgot_password_email_failure(self, client: TestClient, test_user, db):
        """Test forgot password when email sending fails."""
        with patch('app.services.email.send_email') as mock_send:
            mock_send.side_effect = Exception("SMTP Error")
            
            response = client.post(
                "/api/v1/auth/forgot-password",
                params={"email": test_user.email}
            )
            
            # Should still return success
            assert response.status_code == 200
            
            # Token should still be created
            db.refresh(test_user)
            assert test_user.reset_token is not None


@pytest.mark.auth
@pytest.mark.integration
class TestResetPassword:
    """Tests for reset password endpoint."""
    
    def test_reset_password_valid_token(self, client: TestClient, test_user, db):
        """Test password reset with valid token."""
        # Create reset token
        reset_token = "valid_test_token_123"
        test_user.reset_token = reset_token
        test_user.reset_token_expires = datetime.utcnow() + timedelta(hours=24)
        db.commit()
        
        new_password = "NewPassword123!"
        
        response = client.post(
            "/api/v1/auth/reset-password",
            params={
                "token": reset_token,
                "new_password": new_password
            }
        )
        
        assert response.status_code == 200
        assert "successfully" in response.json()["message"].lower()
        
        # Verify token was cleared
        db.refresh(test_user)
        assert test_user.reset_token is None
        assert test_user.reset_token_expires is None
        
        # Verify can login with new password
        login_response = client.post(
            "/api/v1/auth/login",
            json={
                "email": test_user.email,
                "password": new_password
            }
        )
        assert login_response.status_code == 200
    
    def test_reset_password_invalid_token(self, client: TestClient):
        """Test password reset with invalid token."""
        response = client.post(
            "/api/v1/auth/reset-password",
            params={
                "token": "invalid_token",
                "new_password": "NewPassword123!"
            }
        )
        
        assert response.status_code == 400
        assert "invalid" in response.json()["detail"].lower()
    
    def test_reset_password_expired_token(self, client: TestClient, test_user, db):
        """Test password reset with expired token."""
        # Create expired reset token
        reset_token = "expired_token_123"
        test_user.reset_token = reset_token
        test_user.reset_token_expires = datetime.utcnow() - timedelta(hours=1)  # Expired 1 hour ago
        db.commit()
        
        response = client.post(
            "/api/v1/auth/reset-password",
            params={
                "token": reset_token,
                "new_password": "NewPassword123!"
            }
        )
        
        assert response.status_code == 400
        assert "expired" in response.json()["detail"].lower()
    
    def test_reset_password_weak_password(self, client: TestClient, test_user, db):
        """Test password reset with weak password."""
        reset_token = "valid_test_token_456"
        test_user.reset_token = reset_token
        test_user.reset_token_expires = datetime.utcnow() + timedelta(hours=24)
        db.commit()
        
        response = client.post(
            "/api/v1/auth/reset-password",
            params={
                "token": reset_token,
                "new_password": "weak"  # Too short
            }
        )
        
        assert response.status_code == 400
        assert "8 characters" in response.json()["detail"].lower()


@pytest.mark.auth
@pytest.mark.integration
class TestWelcomeEmail:
    """Tests for welcome email on registration."""
    
    def test_registration_sends_welcome_email(self, client: TestClient):
        """Test that registration sends welcome email."""
        with patch('app.services.email.send_email') as mock_send:
            mock_send.return_value = True
            
            response = client.post(
                "/api/v1/auth/register",
                json={
                    "email": "newuser123@example.com",
                    "password": "TestPass123!",
                    "full_name": "New Test User",
                    "role": "subscriber"
                }
            )
            
            assert response.status_code == 201
            
            # Verify welcome email was sent
            assert mock_send.called
            call_args = mock_send.call_args
            assert "newuser123@example.com" in str(call_args)
            assert "Welcome" in str(call_args)
    
    def test_registration_succeeds_even_if_email_fails(self, client: TestClient):
        """Test that registration succeeds even if welcome email fails."""
        with patch('app.services.email.send_email') as mock_send:
            mock_send.side_effect = Exception("SMTP Error")
            
            response = client.post(
                "/api/v1/auth/register",
                json={
                    "email": "newuser456@example.com",
                    "password": "TestPass456!",
                    "full_name": "Another Test User",
                    "role": "subscriber"
                }
            )
            
            # Registration should still succeed
            assert response.status_code == 201
            data = response.json()
            assert data["email"] == "newuser456@example.com"


@pytest.mark.integration
class TestEmailService:
    """Tests for email service functionality."""
    
    def test_send_password_reset_email_with_mock(self):
        """Test password reset email formatting."""
        from app.services.email import send_password_reset_email
        
        with patch('app.services.email.send_email') as mock_send:
            mock_send.return_value = True
            
            result = send_password_reset_email(
                email_to="test@example.com",
                reset_token="test_token_123",
                user_name="Test User"
            )
            
            assert result is True
            assert mock_send.called
            
            # Check email content
            call_args = mock_send.call_args
            kwargs = call_args.kwargs
            assert kwargs["email_to"] == "test@example.com"
            assert "Reset Your Password" in kwargs["subject"]
            assert "test_token_123" in kwargs["html_content"]
            assert "Test User" in kwargs["html_content"]
    
    def test_send_welcome_email_with_mock(self):
        """Test welcome email formatting."""
        from app.services.email import send_welcome_email
        
        with patch('app.services.email.send_email') as mock_send:
            mock_send.return_value = True
            
            result = send_welcome_email(
                email_to="newuser@example.com",
                user_name="New User"
            )
            
            assert result is True
            assert mock_send.called
            
            # Check email content
            call_args = mock_send.call_args
            kwargs = call_args.kwargs
            assert kwargs["email_to"] == "newuser@example.com"
            assert "Welcome" in kwargs["subject"]
            assert "New User" in kwargs["html_content"]
