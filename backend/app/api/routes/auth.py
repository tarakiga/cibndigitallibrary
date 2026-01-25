from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
import secrets
from datetime import datetime, timedelta

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
from app.services.email import send_password_reset_email, send_welcome_email
from app.core.config import settings

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def register_user(user_data: UserCreate, db: Session = Depends(get_db)):
    """
    Register a new user and send welcome email.
    """
    user = create_user_service(db=db, user_data=user_data)
    
    # Send welcome email (non-blocking, don't fail registration if email fails)
    try:
        send_welcome_email(email_to=user.email, user_name=user.full_name)
    except Exception as e:
        # Log error but don't fail registration
        print(f"Failed to send welcome email: {e}")
    
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


@router.post("/forgot-password")
def forgot_password(email: str, db: Session = Depends(get_db)):
    """
    Request password reset. Sends email with reset token.
    Always returns success to prevent email enumeration.
    """
    # Find user by email
    user = db.query(User).filter(User.email == email).first()
    
    if user:
        # Generate secure reset token
        reset_token = secrets.token_urlsafe(32)
        
        # Set token expiration
        expires = datetime.utcnow() + timedelta(hours=settings.PASSWORD_RESET_TOKEN_EXPIRE_HOURS)
        
        # Save token to database
        user.reset_token = reset_token
        user.reset_token_expires = expires
        db.commit()
        
        # Send password reset email
        try:
            send_password_reset_email(
                email_to=user.email,
                reset_token=reset_token,
                user_name=user.full_name
            )
        except Exception as e:
            print(f"Failed to send password reset email: {e}")
            # Continue anyway to prevent email enumeration
    
    # Always return success to prevent email enumeration
    return {"message": "If your email exists in our system, you will receive password reset instructions."}


@router.post("/reset-password")
def reset_password(token: str, new_password: str, db: Session = Depends(get_db)):
    """
    Reset password using reset token.
    """
    from app.core.security import get_password_hash
    
    # Find user by reset token
    user = db.query(User).filter(User.reset_token == token).first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired reset token"
        )
    
    # Check if token has expired
    if not user.reset_token_expires or user.reset_token_expires < datetime.utcnow():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired reset token"
        )
    
    # Validate new password
    if len(new_password) < 8:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password must be at least 8 characters long"
        )
    
    # Update password and clear reset token
    user.hashed_password = get_password_hash(new_password)
    user.reset_token = None
    user.reset_token_expires = None
    db.commit()
    
    return {"message": "Password reset successfully"}
