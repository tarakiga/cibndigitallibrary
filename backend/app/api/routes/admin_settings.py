from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Optional
from app.db.session import get_db
from app.api.dependencies import require_admin
from app.models import PaymentSettings
from app.schemas import PaymentSettingsResponse, PaymentSettingsUpdate

router = APIRouter(prefix="/admin/settings", tags=["Admin Settings"])


def ensure_singleton(db: Session) -> PaymentSettings:
    settings = db.query(PaymentSettings).first()
    if not settings:
        settings = PaymentSettings(active_mode="test")
        db.add(settings)
        db.commit()
        db.refresh(settings)
    return settings


@router.get("/payments", response_model=PaymentSettingsResponse)
def get_payment_settings(db: Session = Depends(get_db), admin=Depends(require_admin)):
    s = ensure_singleton(db)
    return PaymentSettingsResponse(
        active_mode=s.active_mode,
        test_public_key=s.test_public_key,
        live_public_key=s.live_public_key,
        has_test_secret=bool(s.test_secret_key),
        has_live_secret=bool(s.live_secret_key),
    )


@router.put("/payments", response_model=PaymentSettingsResponse)
def update_payment_settings(payload: PaymentSettingsUpdate, db: Session = Depends(get_db), admin=Depends(require_admin)):
    s = ensure_singleton(db)
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
    s = ensure_singleton(db)
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
