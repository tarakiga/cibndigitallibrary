from pydantic import BaseModel, Field
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