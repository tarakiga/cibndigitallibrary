from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.models import User, UserRole
from app.schemas import UserCreate, UserLogin, CIBNMemberLogin
from app.core.security import get_password_hash, verify_password, create_access_token

# This is a placeholder for your MS SQL database connection utility.
# You will need to create this utility to connect to your external database.
from app.db.mssql_connector import mssql_db


def create_user(db: Session, user_data: UserCreate) -> User:
    """Create a new user."""
    # Check if email already exists
    existing_user = db.query(User).filter(User.email == user_data.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Check if CIBN employee ID exists (if provided)
    if user_data.cibn_employee_id:
        existing_cibn = db.query(User).filter(
            User.cibn_employee_id == user_data.cibn_employee_id
        ).first()
        if existing_cibn:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="CIBN employee ID already registered"
            )
    
    # Enforce basic password strength
    password = user_data.password or ""
    # At least 8 chars, must contain letter and number
    if len(password) < 8 or password.isalpha() or password.isdigit():
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Password too weak. Must be at least 8 characters and include letters and numbers."
        )
    
    # Determine role based on CIBN employee ID
    role = UserRole.CIBN_MEMBER if user_data.cibn_employee_id else UserRole.SUBSCRIBER
    
    # Create user
    user = User(
        email=user_data.email,
        hashed_password=get_password_hash(user_data.password),
        full_name=user_data.full_name,
        phone=user_data.phone,
        cibn_employee_id=user_data.cibn_employee_id,
        role=role,
        is_verified=bool(user_data.cibn_employee_id)  # Auto-verify CIBN members
    )
    
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def authenticate_user(db: Session, login_data: UserLogin) -> tuple[User, str]:
    """Authenticate user with email and password."""
    user = db.query(User).filter(User.email == login_data.email).first()
    
    if not user or not verify_password(login_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is inactive"
        )
    
    access_token = create_access_token(data={"sub": str(user.id), "role": user.role})
    return user, access_token


def authenticate_cibn_member(db: Session, login_data: CIBNMemberLogin) -> tuple[User, str]:
    """Authenticate CIBN member with employee ID."""
    # Step 1: Authenticate against the external MS SQL database
    external_member_data = mssql_db.authenticate_member(
        member_id=login_data.cibn_employee_id,
        password=login_data.password
    )

    if not external_member_data:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect employee ID or password"
        )

    # Step 2: Find or create a user in the local PostgreSQL database
    user = db.query(User).filter(
        User.cibn_employee_id == login_data.cibn_employee_id
    ).first()

    if not user:
        # If user doesn't exist locally, create them.
        # Note: The password here is for the local system, not the external one.
        # We use the same password for simplicity, but hash it for storage.
        user = User(
            email=external_member_data.get("Email", f"{login_data.cibn_employee_id}@cibn.org"),
            hashed_password=get_password_hash(login_data.password),
            full_name=f"{external_member_data.get('FirstName', '')} {external_member_data.get('Surname', '')}".strip(),
            cibn_employee_id=login_data.cibn_employee_id,
            role=UserRole.CIBN_MEMBER,
            is_verified=True,
            is_active=True
        )
        db.add(user)
        db.commit()
        db.refresh(user)

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is inactive"
        )

    access_token = create_access_token(data={"sub": str(user.id), "role": user.role})
    return user, access_token


def get_current_user(db: Session, user_id: int) -> User:
    """Get current user from database."""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    return user
