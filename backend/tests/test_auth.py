"""
Tests for authentication endpoints.
"""
import pytest
from fastapi.testclient import TestClient
from app.models import UserRole


@pytest.mark.auth
@pytest.mark.integration
class TestRegister:
    """Tests for user registration endpoint."""
    
    def test_register_subscriber_success(self, client: TestClient):
        """Test successful subscriber registration."""
        response = client.post(
            "/api/v1/auth/register",
            json={
                "email": "newuser@example.com",
                "password": "securepass123",
                "full_name": "New User",
                "phone": "+2348011112222",
                "role": "subscriber"
            }
        )
        
        assert response.status_code == 201
        data = response.json()
        assert data["email"] == "newuser@example.com"
        assert data["full_name"] == "New User"
        assert data["role"] == "subscriber"
        assert "id" in data
        assert "hashed_password" not in data
    
    def test_register_cibn_member_success(self, client: TestClient):
        """Test successful CIBN member registration."""
        response = client.post(
            "/api/v1/auth/register",
            json={
                "email": "cibnmember@example.com",
                "password": "securepass123",
                "full_name": "CIBN Member",
                "phone": "+2348033334444",
                "role": "cibn_member",
                "cibn_employee_id": "EMP123"
            }
        )
        
        assert response.status_code == 201
        data = response.json()
        assert data["email"] == "cibnmember@example.com"
        assert data["role"] == "cibn_member"
        assert data["cibn_employee_id"] == "EMP123"
    
    def test_register_duplicate_email(self, client: TestClient, test_user):
        """Test registration with duplicate email fails."""
        response = client.post(
            "/api/v1/auth/register",
            json={
                "email": test_user.email,
                "password": "anotherpass123",
                "full_name": "Another User",
                "phone": "+2348055556666",
                "role": "subscriber"
            }
        )
        
        assert response.status_code == 400
        assert "already registered" in response.json()["detail"].lower()
    
    def test_register_invalid_email(self, client: TestClient):
        """Test registration with invalid email fails."""
        response = client.post(
            "/api/v1/auth/register",
            json={
                "email": "notanemail",
                "password": "securepass123",
                "full_name": "Test User",
                "role": "subscriber"
            }
        )
        
        assert response.status_code == 422
    
    def test_register_weak_password(self, client: TestClient):
        """Test registration with weak password fails."""
        response = client.post(
            "/api/v1/auth/register",
            json={
                "email": "test@example.com",
                "password": "weak",
                "full_name": "Test User",
                "role": "subscriber"
            }
        )
        
        # Should fail validation (password too short)
        assert response.status_code in [400, 422]


@pytest.mark.auth
@pytest.mark.integration
class TestLogin:
    """Tests for user login endpoint."""
    
    def test_login_success(self, client: TestClient, test_user):
        """Test successful login with email and password."""
        response = client.post(
            "/api/v1/auth/login",
            json={
                "email": test_user.email,
                "password": "testpassword123"
            }
        )
        
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert data["token_type"] == "bearer"
        assert "user" in data
        assert data["user"]["email"] == test_user.email
    
    def test_login_wrong_password(self, client: TestClient, test_user):
        """Test login with wrong password fails."""
        response = client.post(
            "/api/v1/auth/login",
            json={
                "email": test_user.email,
                "password": "wrongpassword"
            }
        )
        
        assert response.status_code == 401
        assert "incorrect" in response.json()["detail"].lower()
    
    def test_login_nonexistent_user(self, client: TestClient):
        """Test login with nonexistent email fails."""
        response = client.post(
            "/api/v1/auth/login",
            json={
                "email": "nonexistent@example.com",
                "password": "anypassword"
            }
        )
        
        assert response.status_code == 401
    
    def test_login_missing_fields(self, client: TestClient):
        """Test login with missing fields fails."""
        response = client.post(
            "/api/v1/auth/login",
            json={
                "email": "test@example.com"
            }
        )
        
        assert response.status_code == 422


@pytest.mark.auth
@pytest.mark.integration
class TestCIBNLogin:
    """Tests for CIBN member login endpoint."""
    
    def test_cibn_login_success(self, client: TestClient, db, mock_mssql_db):
        """Test successful CIBN member login."""
        # Use a unique employee ID for this test
        test_employee_id = "TESTCIBN001"
        test_email = "testcibn@example.com"
        
        # Configure mock to return valid member data
        mock_mssql_db.authenticate_member.return_value = {
            "MemberId": test_employee_id,
            "FirstName": "Test",
            "Surname": "Member",
            "Email": test_email,
            "Arrears": 0,
            "AnnualSub": 5000,
            "Category": "ACIB"
        }
        
        response = client.post(
            "/api/v1/auth/cibn-login",
            json={
                "cibn_employee_id": test_employee_id,
                "password": "cibnpassword123"
            }
        )
        
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert data["token_type"] == "bearer"
        assert data["user"]["role"] == "cibn_member"
        assert data["user"]["cibn_employee_id"] == test_employee_id
    
    def test_cibn_login_wrong_password(self, client: TestClient, test_cibn_member, mock_mssql_db):
        """Test CIBN login with wrong password fails."""
        # Configure mock to return None (authentication failed)
        mock_mssql_db.authenticate_member.return_value = None
        
        response = client.post(
            "/api/v1/auth/cibn-login",
            json={
                "cibn_employee_id": test_cibn_member.cibn_employee_id,
                "password": "wrongpassword"
            }
        )
        
        assert response.status_code == 401
    
    def test_cibn_login_invalid_employee_id(self, client: TestClient, mock_mssql_db):
        """Test CIBN login with invalid employee ID fails."""
        # Configure mock to return None (member not found)
        mock_mssql_db.authenticate_member.return_value = None
        
        response = client.post(
            "/api/v1/auth/cibn-login",
            json={
                "cibn_employee_id": "INVALID999",
                "password": "anypassword"
            }
        )
        
        assert response.status_code == 401


@pytest.mark.auth
@pytest.mark.integration
class TestGetCurrentUser:
    """Tests for getting current user information."""
    
    def test_get_current_user_success(self, client: TestClient, test_user, user_token):
        """Test getting current user info with valid token."""
        response = client.get(
            "/api/v1/auth/me",
            headers={"Authorization": f"Bearer {user_token}"}
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["email"] == test_user.email
        assert data["full_name"] == test_user.full_name
        assert "hashed_password" not in data
    
    def test_get_current_user_no_token(self, client: TestClient):
        """Test getting current user without token fails."""
        response = client.get("/api/v1/auth/me")
        
        assert response.status_code == 403
    
    def test_get_current_user_invalid_token(self, client: TestClient):
        """Test getting current user with invalid token fails."""
        response = client.get(
            "/api/v1/auth/me",
            headers={"Authorization": "Bearer invalid_token_here"}
        )
        
        assert response.status_code == 401
    
    def test_get_current_user_cibn_member(self, client: TestClient, test_cibn_member, cibn_token):
        """Test getting current user info for CIBN member."""
        response = client.get(
            "/api/v1/auth/me",
            headers={"Authorization": f"Bearer {cibn_token}"}
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["role"] == "cibn_member"
        assert data["cibn_employee_id"] == test_cibn_member.cibn_employee_id
    
    def test_get_current_user_admin(self, client: TestClient, test_admin, admin_token):
        """Test getting current user info for admin."""
        response = client.get(
            "/api/v1/auth/me",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["role"] == "admin"
