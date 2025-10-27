from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.schemas import UserCreate, UserLogin, CIBNMemberLogin, UserResponse, Token, UserProfileUpdate, PasswordChange
from app.services.auth import (
    create_user as create_user_service,
    authenticate_user as authenticate_user_service,
    authenticate_cibn_member as authenticate_cibn_member_service,
    get_current_user as get_current_user_service
)
from app.api.dependencies import get_current_user_dependency
from app.models import User

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def register_user(user_data: UserCreate, db: Session = Depends(get_db)):
    """
    Register a new user.
    """
    user = create_user_service(db=db, user_data=user_data)
    return user


@router.post("/login", response_model=Token)
def login_for_access_token(login_data: UserLogin, db: Session = Depends(get_db)):
    """
    Login with email and password to get an access token.
    """
    user, access_token = authenticate_user_service(db=db, login_data=login_data)
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user
    }


@router.post("/cibn-login", response_model=Token)
def cibn_login_for_access_token(login_data: CIBNMemberLogin, db: Session = Depends(get_db)):
    """
    Login with CIBN employee ID and password to get an access token.
    """
    user, access_token = authenticate_cibn_member_service(db=db, login_data=login_data)
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user
    }


@router.get("/me", response_model=UserResponse)
def read_users_me(current_user: User = Depends(get_current_user_dependency)):
    """
    Get current user.
    """
    return current_user


@router.post("/refresh", response_model=Token)
def refresh_token(current_user: User = Depends(get_current_user_dependency), db: Session = Depends(get_db)):
    """
    Refresh access token.
    """
    from app.core.security import create_access_token
    
    user = get_current_user_service(db=db, user_id=current_user.id)
    if not user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")

    access_token = create_access_token(data={"sub": str(user.id), "role": user.role})
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user
    }


@router.patch("/me", response_model=UserResponse)
def update_profile(
    profile_data: UserProfileUpdate,
    current_user: User = Depends(get_current_user_dependency),
    db: Session = Depends(get_db)
):
    """
    Update current user's profile.
    """
    # Check if email is being changed and if it's already taken
    if profile_data.email and profile_data.email != current_user.email:
        existing_user = db.query(User).filter(User.email == profile_data.email).first()
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )
        current_user.email = profile_data.email
    
    # Update other fields
    if profile_data.full_name is not None:
        current_user.full_name = profile_data.full_name
    if profile_data.phone is not None:
        current_user.phone = profile_data.phone
    
    db.commit()
    db.refresh(current_user)
    return current_user


@router.post("/me/change-password")
def change_password(
    password_data: PasswordChange,
    current_user: User = Depends(get_current_user_dependency),
    db: Session = Depends(get_db)
):
    """
    Change current user's password.
    """
    from app.core.security import verify_password, get_password_hash
    
    # Verify current password
    if not verify_password(password_data.current_password, current_user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Current password is incorrect"
        )
    
    # Validate new password
    if len(password_data.new_password) < 8:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="New password must be at least 8 characters long"
        )
    
    # Update password
    current_user.hashed_password = get_password_hash(password_data.new_password)
    db.commit()
    
    return {"message": "Password changed successfully"}
