from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Optional
from app.db.session import get_db
from app.api.dependencies import require_admin
from app.models import PaymentSettings, EmailSettings
from app.schemas import PaymentSettingsResponse, PaymentSettingsUpdate
from app.schemas.settings import EmailSettingsResponse, EmailSettingsUpdate, EmailTestRequest

router = APIRouter(prefix="/admin/settings", tags=["Admin Settings"])


# ============== Payment Settings ==============

def ensure_payment_singleton(db: Session) -> PaymentSettings:
    settings = db.query(PaymentSettings).first()
    if not settings:
        settings = PaymentSettings(active_mode="test")
        db.add(settings)
        db.commit()
        db.refresh(settings)
    return settings


@router.get("/payments", response_model=PaymentSettingsResponse)
def get_payment_settings(db: Session = Depends(get_db), admin=Depends(require_admin)):
    s = ensure_payment_singleton(db)
    return PaymentSettingsResponse(
        active_mode=s.active_mode,
        test_public_key=s.test_public_key,
        live_public_key=s.live_public_key,
        has_test_secret=bool(s.test_secret_key),
        has_live_secret=bool(s.live_secret_key),
    )


@router.put("/payments", response_model=PaymentSettingsResponse)
def update_payment_settings(payload: PaymentSettingsUpdate, db: Session = Depends(get_db), admin=Depends(require_admin)):
    s = ensure_payment_singleton(db)
    if payload.active_mode is not None:
        s.active_mode = payload.active_mode
    if payload.test_public_key is not None:
        s.test_public_key = payload.test_public_key
    if payload.live_public_key is not None:
        s.live_public_key = payload.live_public_key
    # Update secrets only when provided
    if payload.test_secret_key is not None and payload.test_secret_key.strip():
        s.test_secret_key = payload.test_secret_key.strip()
    if payload.live_secret_key is not None and payload.live_secret_key.strip():
        s.live_secret_key = payload.live_secret_key.strip()
    db.commit()
    db.refresh(s)
    return PaymentSettingsResponse(
        active_mode=s.active_mode,
        test_public_key=s.test_public_key,
        live_public_key=s.live_public_key,
        has_test_secret=bool(s.test_secret_key),
        has_live_secret=bool(s.live_secret_key),
    )


@router.post("/payments/test")
async def test_payment_settings(db: Session = Depends(get_db), admin=Depends(require_admin)):
    s = ensure_payment_singleton(db)
    # Choose secret for active mode with fallback to env
    from app.core.config import settings as app_settings
    secret = None
    if s.active_mode == "live" and s.live_secret_key:
        secret = s.live_secret_key.strip()
    elif s.active_mode == "test" and s.test_secret_key:
        secret = s.test_secret_key.strip()
    if not secret and app_settings.PAYSTACK_SECRET_KEY:
        secret = app_settings.PAYSTACK_SECRET_KEY.strip()
    if not secret:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No secret key configured for active mode or .env")

    # Basic prefix validation to avoid gateway 401
    if s.active_mode == "test" and not secret.startswith("sk_test_"):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Active mode is 'test' but secret key is not an sk_test_ key")
    if s.active_mode == "live" and not secret.startswith("sk_live_"):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Active mode is 'live' but secret key is not an sk_live_ key")

    # Attempt a harmless initialize with NGN 1.00
    from app.services.payment import paystack_service
    import uuid
    ref = f"KEYTEST-{uuid.uuid4().hex[:8]}"
    data = await paystack_service.initialize_transaction(
        email="test@cibn.org",
        amount=1.0,
        reference=ref,
        callback_url="https://example.com/ignore",
        secret_key_override=secret,
    )
    return {"ok": True, "message": "Credentials valid", "reference": data.get("reference"), "mode": s.active_mode}


# ============== Email Settings ==============

def ensure_email_singleton(db: Session) -> EmailSettings:
    """Ensure a single EmailSettings record exists."""
    settings = db.query(EmailSettings).first()
    if not settings:
        settings = EmailSettings()
        db.add(settings)
        db.commit()
        db.refresh(settings)
    return settings


@router.get("/email", response_model=EmailSettingsResponse)
def get_email_settings(db: Session = Depends(get_db), admin=Depends(require_admin)):
    """Get current email/SMTP configuration."""
    s = ensure_email_singleton(db)
    return EmailSettingsResponse(
        smtp_host=s.smtp_host,
        smtp_port=s.smtp_port or 587,
        smtp_user=s.smtp_user,
        has_password=bool(s.smtp_password),
        smtp_tls=s.smtp_tls if s.smtp_tls is not None else True,
        emails_from_email=s.emails_from_email,
        emails_from_name=s.emails_from_name or "CIBN Digital Library",
    )


@router.put("/email", response_model=EmailSettingsResponse)
def update_email_settings(payload: EmailSettingsUpdate, db: Session = Depends(get_db), admin=Depends(require_admin)):
    """Update email/SMTP configuration."""
    s = ensure_email_singleton(db)
    
    if payload.smtp_host is not None:
        s.smtp_host = payload.smtp_host.strip() if payload.smtp_host else None
    if payload.smtp_port is not None:
        s.smtp_port = payload.smtp_port
    if payload.smtp_user is not None:
        s.smtp_user = payload.smtp_user.strip() if payload.smtp_user else None
    if payload.smtp_password is not None and payload.smtp_password.strip():
        # Only update password if provided and non-empty
        s.smtp_password = payload.smtp_password.strip()
    if payload.smtp_tls is not None:
        s.smtp_tls = payload.smtp_tls
    if payload.emails_from_email is not None:
        s.emails_from_email = payload.emails_from_email.strip() if payload.emails_from_email else None
    if payload.emails_from_name is not None:
        s.emails_from_name = payload.emails_from_name.strip() if payload.emails_from_name else None
    
    db.commit()
    db.refresh(s)
    
    return EmailSettingsResponse(
        smtp_host=s.smtp_host,
        smtp_port=s.smtp_port or 587,
        smtp_user=s.smtp_user,
        has_password=bool(s.smtp_password),
        smtp_tls=s.smtp_tls if s.smtp_tls is not None else True,
        emails_from_email=s.emails_from_email,
        emails_from_name=s.emails_from_name or "CIBN Digital Library",
    )


@router.post("/email/test")
def test_email_settings(payload: EmailTestRequest, db: Session = Depends(get_db), admin=Depends(require_admin)):
    """Send a test email to verify SMTP configuration."""
    from app.services.email import send_test_email
    
    success = send_test_email(recipient_email=payload.recipient_email, db=db)
    
    if success:
        return {"ok": True, "message": f"Test email sent successfully to {payload.recipient_email}"}
    else:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to send test email. Please check your SMTP configuration."
        )


# ============== Upload Settings ==============

from app.models.settings import UploadSettings
from app.schemas.settings import UploadSettingsResponse, UploadSettingsUpdate

def ensure_upload_singleton(db: Session) -> UploadSettings:
    settings_obj = db.query(UploadSettings).first()
    if not settings_obj:
        settings_obj = UploadSettings()
        db.add(settings_obj)
        db.commit()
        db.refresh(settings_obj)
    return settings_obj


@router.get("/upload", response_model=UploadSettingsResponse)
def get_upload_settings(db: Session = Depends(get_db), admin=Depends(require_admin)):
    """Get current file upload size limits."""
    s = ensure_upload_singleton(db)
    return UploadSettingsResponse(
        max_file_size_document=s.max_file_size_document,
        max_file_size_video=s.max_file_size_video,
        max_file_size_audio=s.max_file_size_audio,
        max_file_size_image=s.max_file_size_image,
    )


@router.put("/upload", response_model=UploadSettingsResponse)
def update_upload_settings(payload: UploadSettingsUpdate, db: Session = Depends(get_db), admin=Depends(require_admin)):
    """Update file upload size limits."""
    s = ensure_upload_singleton(db)
    
    # Only update if value is provided (None means no change) 
    # BUT wait, how to unset a value? 
    # For now, let's assume we can pass specific large numbers or null if our schema allowed optional nulls explicitly
    # Schema says Optional[int], so None means "do not update".
    # To unset (set to unlimited), checking if payload has field set is tricky in Pydantic v1 vs v2.
    # We'll assume if it's in payload.dict(exclude_unset=True)
    
    updates = payload.dict(exclude_unset=True)
    
    if "max_file_size_document" in updates:
        s.max_file_size_document = updates["max_file_size_document"]
    
    if "max_file_size_video" in updates:
        s.max_file_size_video = updates["max_file_size_video"]
        
    if "max_file_size_audio" in updates:
        s.max_file_size_audio = updates["max_file_size_audio"]
        
    if "max_file_size_image" in updates:
        s.max_file_size_image = updates["max_file_size_image"]
    
    db.commit()
    db.refresh(s)
    
    return UploadSettingsResponse(
        max_file_size_document=s.max_file_size_document,
        max_file_size_video=s.max_file_size_video,
        max_file_size_audio=s.max_file_size_audio,
        max_file_size_image=s.max_file_size_image,
    )
