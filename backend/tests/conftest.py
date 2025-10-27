"""
Test configuration and fixtures for FastAPI backend testing.
"""
import pytest
import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from fastapi.testclient import TestClient
from typing import Generator
from unittest.mock import patch, MagicMock

# Set testing environment variable
os.environ["TESTING"] = "true"

from app.main import app
from app.db.session import Base, get_db
from app.core.config import settings
from app.models import User, Content, Order, ContentType, ContentCategory, UserRole
from app.services.auth import get_password_hash, create_access_token

# Test database URL (using SQLite for tests)
TEST_DATABASE_URL = "sqlite:///./test.db"

# Create test engine
test_engine = create_engine(
    TEST_DATABASE_URL,
    connect_args={"check_same_thread": False}  # Needed for SQLite
)

# Create test session factory
TestSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)


@pytest.fixture(scope="function")
def db() -> Generator:
    """
    Create a fresh database for each test.
    """
    # Create tables
    Base.metadata.create_all(bind=test_engine)
    
    # Create session
    session = TestSessionLocal()
    
    try:
        yield session
    finally:
        session.close()
        # Drop all tables after test
        Base.metadata.drop_all(bind=test_engine)


@pytest.fixture(scope="function")
def mock_mssql_db():
    """
    Mock the MSSQL database connector for testing.
    """
    with patch('app.services.auth.mssql_db') as mock:
        # Configure mock to return valid CIBN member data
        mock.authenticate_member = MagicMock()
        yield mock


@pytest.fixture(scope="function")
def client(db, mock_mssql_db) -> Generator:
    """
    Create a test client that uses the test database.
    """
    def override_get_db():
        try:
            yield db
        finally:
            pass
    
    app.dependency_overrides[get_db] = override_get_db
    
    with TestClient(app) as test_client:
        yield test_client
    
    app.dependency_overrides.clear()


@pytest.fixture
def test_user(db) -> User:
    """
    Create a test subscriber user.
    """
    user = User(
        email="testuser@example.com",
        hashed_password=get_password_hash("testpassword123"),
        full_name="Test User",
        phone="+2348012345678",
        role=UserRole.SUBSCRIBER,
        is_active=True,
        is_verified=True
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@pytest.fixture
def test_cibn_member(db) -> User:
    """
    Create a test CIBN member user.
    """
    user = User(
        email="cibn@example.com",
        hashed_password=get_password_hash("cibnpassword123"),
        full_name="CIBN Member",
        phone="+2348087654321",
        role=UserRole.CIBN_MEMBER,
        cibn_employee_id="EMP001",
        is_active=True,
        is_verified=True
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@pytest.fixture
def test_admin(db) -> User:
    """
    Create a test admin user.
    """
    user = User(
        email="admin@example.com",
        hashed_password=get_password_hash("adminpassword123"),
        full_name="Admin User",
        phone="+2348099999999",
        role=UserRole.ADMIN,
        is_active=True,
        is_verified=True
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@pytest.fixture
def user_token(test_user) -> str:
    """
    Generate JWT token for test user.
    """
    return create_access_token(data={"sub": str(test_user.id), "role": test_user.role})


@pytest.fixture
def cibn_token(test_cibn_member) -> str:
    """
    Generate JWT token for CIBN member.
    """
    return create_access_token(data={"sub": str(test_cibn_member.id), "role": test_cibn_member.role})


@pytest.fixture
def admin_token(test_admin) -> str:
    """
    Generate JWT token for admin.
    """
    return create_access_token(data={"sub": str(test_admin.id), "role": test_admin.role})


@pytest.fixture
def test_content_public(db) -> Content:
    """
    Create a public test content item.
    """
    content = Content(
        title="Public Document",
        description="A publicly available document",
        content_type=ContentType.DOCUMENT,
        category=ContentCategory.RESEARCH_PAPER,
        price=1000.0,
        is_exclusive=False,
        is_active=True,
        file_url="/uploads/public-doc.pdf",
        thumbnail_url="/uploads/public-thumb.jpg"
    )
    db.add(content)
    db.commit()
    db.refresh(content)
    return content


@pytest.fixture
def test_content_exclusive(db) -> Content:
    """
    Create an exclusive test content item (CIBN members only).
    """
    content = Content(
        title="Exclusive Document",
        description="A CIBN members-only document",
        content_type=ContentType.DOCUMENT,
        category=ContentCategory.CIBN_PUBLICATION,
        price=5000.0,
        is_exclusive=True,
        is_active=True,
        file_url="/uploads/exclusive-doc.pdf",
        thumbnail_url="/uploads/exclusive-thumb.jpg"
    )
    db.add(content)
    db.commit()
    db.refresh(content)
    return content


@pytest.fixture
def test_physical_content(db) -> Content:
    """
    Create a physical content item with stock.
    """
    content = Content(
        title="Physical Book",
        description="A physical book with limited stock",
        content_type=ContentType.PHYSICAL,
        category=ContentCategory.EXAM_TEXT,
        price=3000.0,
        is_exclusive=False,
        is_active=True,
        stock_quantity=10,
        file_url=None,
        thumbnail_url="/uploads/book-thumb.jpg"
    )
    db.add(content)
    db.commit()
    db.refresh(content)
    return content


# Pytest configuration
def pytest_configure(config):
    """Configure pytest markers."""
    config.addinivalue_line("markers", "unit: Unit tests")
    config.addinivalue_line("markers", "integration: Integration tests")
    config.addinivalue_line("markers", "auth: Authentication tests")
    config.addinivalue_line("markers", "content: Content tests")
    config.addinivalue_line("markers", "orders: Order tests")
