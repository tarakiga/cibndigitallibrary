# Testing the CIBN Library Backend

## Quick Start

### Option 1: Using the Test Runner Script (Recommended)

The easiest way to run tests:

```powershell
cd backend
.\run_tests.ps1
```

This script will:
- ✅ Check and create virtual environment if needed
- ✅ Install all dependencies
- ✅ Configure test database (SQLite)
- ✅ Run all tests with verbose output
- ✅ Show summary of results

### Option 2: Manual Testing

If you prefer to run tests manually:

```powershell
# 1. Navigate to backend directory
cd backend

# 2. Activate virtual environment
.\.venv\Scripts\Activate.ps1

# 3. Run tests
pytest tests/
```

## Test Commands

### Run All Tests
```powershell
.\run_tests.ps1
```

### Run Specific Test Files
```powershell
# Authentication tests
.\run_tests.ps1 tests/test_auth.py

# Content tests
.\run_tests.ps1 tests/test_content.py

# Order tests
.\run_tests.ps1 tests/test_orders.py
```

### Run Specific Test Class
```powershell
.\run_tests.ps1 tests/test_auth.py::TestLogin
```

### Run With Coverage Report
```powershell
.\run_tests.ps1 --cov=app --cov-report=html
```
Then open `htmlcov/index.html` in your browser.

### Run in Watch Mode (Auto-rerun on changes)
```powershell
pytest-watch tests/
```

## What Gets Tested?

### ✅ Authentication (`test_auth.py`)
- **User Registration**
  - Regular subscribers
  - CIBN members with employee ID
  - Duplicate email prevention
  - Input validation
  
- **User Login**
  - Email/password authentication
  - CIBN employee ID authentication
  - Wrong password handling
  - Invalid credentials
  
- **Token Authentication**
  - JWT token generation
  - Token validation
  - Current user retrieval
  - Permission levels (subscriber, CIBN member, admin)

### ✅ Content Management (`test_content.py`)
- **Content Listing**
  - Public content for all users
  - Exclusive content for CIBN members only
  - Pagination (page size, page number)
  - Filtering (type, category, price range)
  - Search functionality
  
- **Access Control**
  - Unauthenticated users see only public content
  - Regular subscribers see only public content
  - CIBN members see all content
  - Admins see all content
  
- **Content CRUD Operations**
  - Create content (admin only)
  - Update content (admin only)
  - Delete content (admin only)
  - Get single content item
  
### ✅ Orders & Payments (`test_orders.py`)
- **Order Creation**
  - Single item orders
  - Multiple item orders
  - Total amount calculation
  - Stock validation for physical items
  - Inactive content prevention
  
- **Payment Processing**
  - Payment initialization (Paystack)
  - Payment verification
  - Order status updates
  - Purchase creation for digital content
  - Stock deduction for physical items
  
- **Order Retrieval**
  - List user's orders
  - Get specific order
  - Access control (users can only see their own orders)

## Test Database

**Important:** Tests use a **separate SQLite database** that:
- ✅ Does NOT touch your PostgreSQL production database
- ✅ Creates fresh database for each test
- ✅ Automatically cleans up after tests
- ✅ Runs in memory for speed

**No database setup required!** Just run the tests.

## Test Fixtures

Pre-configured test data is available via fixtures:

```python
def test_example(client, test_user, user_token):
    # test_user: A regular subscriber
    # user_token: JWT token for authentication
    response = client.get(
        "/api/v1/auth/me",
        headers={"Authorization": f"Bearer {user_token}"}
    )
    assert response.status_code == 200
```

Available fixtures:
- `client`: FastAPI test client
- `db`: Database session
- `test_user`: Regular subscriber
- `test_cibn_member`: CIBN member
- `test_admin`: Admin user
- `user_token`, `cibn_token`, `admin_token`: Authentication tokens
- `test_content_public`: Public content item
- `test_content_exclusive`: CIBN-exclusive content
- `test_physical_content`: Physical item with stock

## Common Test Patterns

### Testing Protected Endpoints
```python
def test_protected_endpoint(client, user_token):
    response = client.get(
        "/api/v1/protected",
        headers={"Authorization": f"Bearer {user_token}"}
    )
    assert response.status_code == 200
```

### Testing Access Control
```python
def test_admin_only(client, user_token):
    # Regular user should be forbidden
    response = client.post(
        "/api/v1/admin/action",
        headers={"Authorization": f"Bearer {user_token}"}
    )
    assert response.status_code == 403
```

### Testing Validation
```python
def test_invalid_input(client):
    response = client.post(
        "/api/v1/resource",
        json={"invalid": "data"}
    )
    assert response.status_code == 422
```

## Interpreting Results

### ✅ Success Output
```
tests/test_auth.py::TestLogin::test_login_success PASSED [100%]

======================== 1 passed in 0.23s ========================
```

### ❌ Failure Output
```
tests/test_auth.py::TestLogin::test_login_success FAILED
E   AssertionError: assert 401 == 200
```

### 📊 Coverage Report
After running with `--cov`, you'll see:
```
Name                Stmts   Miss  Cover
-----------------------------------------
app/api/routes/auth.py    45      0   100%
app/models/user.py        32      2    94%
-----------------------------------------
TOTAL                    234     12    95%
```

## Troubleshooting

### "ModuleNotFoundError: No module named 'app'"
Solution: Make sure you're in the `backend` directory.

### "ImportError: email-validator is not installed"
Solution: Run `uv pip install -r requirements.txt`

### "All tests are being skipped"
Solution: Check that test files start with `test_` and test functions start with `test_`.

### Database Connection Error
If you see PostgreSQL connection errors, it means `app.main` is being executed during import. This is expected during conftest loading. The fix would be to avoid database operations in main.py during import.

## Best Practices for Writing Tests

1. **Descriptive Names**: `test_user_can_purchase_content` is better than `test_purchase`
2. **Arrange-Act-Assert**: Set up data, perform action, verify result
3. **One Concept Per Test**: Each test should verify one specific behavior
4. **Use Fixtures**: Avoid duplicating test data setup
5. **Mock External Services**: Don't call real payment APIs in tests
6. **Test Edge Cases**: Empty lists, null values, boundary conditions
7. **Test Error Paths**: Not just happy paths

## CI/CD Integration

These tests are CI/CD ready. Example GitHub Actions workflow:

```yaml
name: Backend Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-python@v4
        with:
          python-version: '3.11'
      - name: Install uv
        run: pip install uv
      - name: Run tests
        run: |
          cd backend
          uv venv
          source .venv/bin/activate
          uv pip install -r requirements.txt
          pytest tests/ --cov=app
```

## Next Steps

1. **Run the tests** to verify everything works
2. **Check coverage** to find untested code
3. **Add tests** for new features before implementing them (TDD)
4. **Review failing tests** to catch bugs early
5. **Keep tests fast** so you run them frequently

---

For more detailed information, see:
- `tests/README.md` - Complete testing documentation
- `tests/conftest.py` - Test configuration and fixtures
- `pytest.ini` - Pytest configuration

**Happy Testing! 🧪**
