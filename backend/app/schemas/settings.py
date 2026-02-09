from pydantic import BaseModel, Field, EmailStr
from typing import Optional


class PaymentSettingsResponse(BaseModel):
    active_mode: str = Field(pattern="^(test|live)$")
    # Masked info
    test_public_key: Optional[str] = None
    live_public_key: Optional[str] = None
    has_test_secret: bool = False
    has_live_secret: bool = False


class PaymentSettingsUpdate(BaseModel):
    active_mode: Optional[str] = Field(default=None, pattern="^(test|live)$")
    test_public_key: Optional[str] = None
    test_secret_key: Optional[str] = None
    live_public_key: Optional[str] = None
    live_secret_key: Optional[str] = None


# Email Settings Schemas
class EmailSettingsResponse(BaseModel):
    """Response schema for email settings (password masked)."""
    smtp_host: Optional[str] = None
    smtp_port: Optional[int] = 587
    smtp_user: Optional[str] = None
    has_password: bool = False  # Never expose actual password
    smtp_tls: Optional[bool] = True
    emails_from_email: Optional[str] = None
    emails_from_name: Optional[str] = "CIBN Digital Library"
    
    class Config:
        from_attributes = True


class EmailSettingsUpdate(BaseModel):
    """Update schema for email settings."""
    smtp_host: Optional[str] = None
    smtp_port: Optional[int] = None
    smtp_user: Optional[str] = None
    smtp_password: Optional[str] = None  # Only set if user provides new password
    smtp_tls: Optional[bool] = None
    emails_from_email: Optional[str] = None
    emails_from_name: Optional[str] = None


class EmailTestRequest(BaseModel):
    """Request schema for sending a test email."""
    recipient_email: EmailStr