from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime
from decimal import Decimal
from app.models.user import UserRole


class UserBase(BaseModel):
    email: EmailStr
    full_name: str
    phone: Optional[str] = None
    avatar_url: Optional[str] = None


class UserCreate(UserBase):
    password: str
    cibn_employee_id: Optional[str] = None


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class CIBNMemberLogin(BaseModel):
    cibn_employee_id: str
    password: str


class UserResponse(UserBase):
    id: int
    role: UserRole
    cibn_employee_id: Optional[str]
    arrears: Optional[Decimal] = None
    annual_subscription: Optional[Decimal] = None
    is_active: bool
    is_verified: bool
    created_at: datetime
    
    class Config:
        from_attributes = True


class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse


class PasswordResetRequest(BaseModel):
    email: EmailStr


class UserProfileUpdate(BaseModel):
    """Schema for updating user profile"""
    full_name: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[EmailStr] = None
    avatar_url: Optional[str] = None


class PasswordChange(BaseModel):
    """Schema for changing password"""
    current_password: str
    new_password: str
