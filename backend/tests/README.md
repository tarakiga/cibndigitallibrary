# Backend Testing Guide

## Overview

This directory contains comprehensive tests for the CIBN Digital Library backend API. The tests are organized into three main files covering authentication, content management, and order processing.

## Test Structure

```
tests/
├── conftest.py          # Test configuration, fixtures, and database setup
├── test_auth.py         # Authentication endpoint tests
├── test_content.py      # Content management endpoint tests
├── test_orders.py       # Order and payment endpoint tests
└── README.md            # This file
```

## Test Categories

### 1. Authentication Tests (`test_auth.py`)
- User registration (subscriber, CIBN member, admin)
- Email/password login
- CIBN employee ID login
- Token-based authentication
- Current user retrieval

### 2. Content Tests (`test_content.py`)
- Listing content with filters and pagination
- Access control (public vs CIBN-exclusive content)
- Content creation (admin only)
- Content updates (admin only)
- Content deletion (admin only)
- Search and filtering

### 3. Order Tests (`test_orders.py`)
- Order creation with validation
- Stock management for physical items
- Payment initialization (Paystack)
- Payment verification
- Order retrieval
- Purchase creation for digital content

## Running Tests

### Prerequisites

1. **Activate virtual environment:**
   ```powershell
   .\.venv\Scripts\Activate.ps1
   ```

2. **Install dependencies:**
   ```bash
   uv pip install -r requirements.txt
   ```

### Run All Tests

```bash
pytest tests/
```

### Run Specific Test Files

```bash
# Authentication tests only
pytest tests/test_auth.py

# Content tests only
pytest tests/test_content.py

# Order tests only
pytest tests/test_orders.py
```

### Run Specific Test Classes

```bash
# Run only registration tests
pytest tests/test_auth.py::TestRegister

# Run only content listing tests
pytest tests/test_content.py::TestListContent
```

### Run Specific Test Methods

```bash
# Run a single test
pytest tests/test_auth.py::TestRegister::test_register_subscriber_success
```

### Run Tests by Marker

Tests are organized with markers for easy filtering:

```bash
# Run only auth tests
pytest -m auth

# Run only integration tests
pytest -m integration

# Run only unit tests
pytest -m unit
```

### Run with Coverage Report

```bash
# Generate coverage report
pytest --cov=app --cov-report=html

# View coverage report
# Open htmlcov/index.html in browser
```

### Run Tests with Verbose Output

```bash
pytest -v

# Extra verbose with full output
pytest -vv
```

### Run Tests and Stop on First Failure

```bash
pytest -x
```

## Test Database

Tests use an **in-memory SQLite database** that is:
- Created fresh for each test
- Automatically cleaned up after each test
- Completely isolated from production data

**No PostgreSQL connection required for tests!**

## Fixtures

### User Fixtures
- `test_user`: Regular subscriber user
- `test_cibn_member`: CIBN member with employee ID
- `test_admin`: Admin user
- `user_token`: JWT token for regular user
- `cibn_token`: JWT token for CIBN member
- `admin_token`: JWT token for admin

### Content Fixtures
- `test_content_public`: Public content item
- `test_content_exclusive`: CIBN-exclusive content
- `test_physical_content`: Physical item with stock

### Database Fixtures
- `db`: Fresh database session for each test
- `client`: FastAPI test client

## Writing New Tests

### Example Test Structure

```python
import pytest
from fastapi.testclient import TestClient

@pytest.mark.integration
@pytest.mark.your_category
class TestYourFeature:
    """Tests for your feature."""
    
    def test_your_scenario(self, client: TestClient, user_token):
        """Test description."""
        response = client.get(
            "/api/v1/your-endpoint",
            headers={"Authorization": f"Bearer {user_token}"}
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["expected_field"] == "expected_value"
```

### Best Practices

1. **Use descriptive test names** that explain what is being tested
2. **One assertion per test** when possible
3. **Test both success and failure cases**
4. **Use fixtures** to avoid code duplication
5. **Mock external services** (like Paystack) in tests
6. **Clean up after tests** (handled automatically by fixtures)

## Mocking External Services

Payment tests mock the Paystack service to avoid real API calls:

```python
from unittest.mock import patch

@patch('app.services.payment.paystack_service.verify_transaction')
async def test_verify_payment(self, mock_verify, client, user_token):
    mock_verify.return_value = {"status": "success"}
    # ... rest of test
```

## Continuous Integration

These tests are designed to run in CI/CD pipelines:

```yaml
# Example GitHub Actions workflow
- name: Run tests
  run: |
    cd backend
    uv pip install -r requirements.txt
    pytest tests/ --cov=app --cov-report=xml
```

## Troubleshooting

### Import Errors
- Ensure virtual environment is activated
- Install all dependencies: `uv pip install -r requirements.txt`

### Database Connection Errors
- Tests use SQLite, not PostgreSQL
- If you see PostgreSQL errors, check that app.main is not being executed during import

### Fixture Not Found
- Check that conftest.py is in tests/ directory
- Ensure fixture names match exactly

### Test Failures
- Run with `-vv` for detailed output
- Check test.db file (created during tests, cleaned up after)
- Verify fixtures are providing expected data

## Test Coverage

Current test coverage includes:
- ✅ Authentication (registration, login, token validation)
- ✅ Content management (CRUD operations)
- ✅ Access control (role-based permissions)
- ✅ Order creation and validation
- ✅ Payment processing (mocked)
- ✅ Stock management
- ✅ Pagination and filtering

## Future Test Additions

Consider adding tests for:
- File upload functionality
- Email verification
- Password reset
- Admin dashboard operations
- Webhooks from Paystack
- Rate limiting
- Error handling edge cases
