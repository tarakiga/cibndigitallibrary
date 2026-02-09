import httpx
from typing import Dict, Any
from fastapi import HTTPException, status
from app.core.config import settings
import os


class PaystackService:
    """Service for interacting with Paystack API."""
    
    BASE_URL = "https://api.paystack.co"
    
    def __init__(self):
        self.secret_key = settings.PAYSTACK_SECRET_KEY
        self.headers = {
            "Authorization": f"Bearer {self.secret_key}",
            "Content-Type": "application/json"
        }
    
    async def initialize_transaction(
        self, 
        email: str, 
        amount: float, 
        reference: str,
        callback_url: str = None,
        secret_key_override: str | None = None,
    ) -> Dict[str, Any]:
        """Initialize a payment transaction."""
        if os.getenv("TESTING") == "true":
            if os.getenv("PAYSTACK_TEST_MODE") == "success":
                return {
                    "authorization_url": f"https://paystack.test/authorize/{reference}",
                    "access_code": "TEST_ACCESS_CODE",
                    "reference": reference,
                }
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Payment service unavailable",
            )
        # Paystack expects amount in kobo (NGN * 100)
        amount_kobo = int(amount * 100)
        
        payload = {
            "email": email,
            "amount": amount_kobo,
            "reference": reference,
            "callback_url": callback_url or f"{settings.FRONTEND_URL}/payment/callback"
        }
        
        # Determine headers per request to avoid cross-call mutation
        secret = (secret_key_override or self.secret_key)
        headers = {
            "Authorization": f"Bearer {secret}",
            "Content-Type": "application/json",
        }
        async with httpx.AsyncClient() as client:
            try:
                response = await client.post(
                    f"{self.BASE_URL}/transaction/initialize",
                    json=payload,
                    headers=headers
                )
                response.raise_for_status()
                data = response.json()
                
                if not data.get("status"):
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail="Failed to initialize payment"
                    )
                
                return data["data"]
            
            except httpx.HTTPStatusError as e:
                if e.response is not None and e.response.status_code == 401:
                    # Upstream (Paystack) unauthorized. Do NOT bubble a 401 to the client
                    # to avoid logging the user out on the frontend. Treat as bad gateway.
                    raise HTTPException(
                        status_code=status.HTTP_502_BAD_GATEWAY,
                        detail=(
                            "Payment service error: Unauthorized (401) from gateway. "
                            "Check PAYSTACK_SECRET_KEY in backend .env or Admin Settings (Payments) "
                            "and ensure it is a valid key for the selected mode."
                        ),
                    )
                raise HTTPException(
                    status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                    detail=f"Payment service error: {str(e)}"
                )
            except httpx.HTTPError as e:
                raise HTTPException(
                    status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                    detail=f"Payment service error: {str(e)}"
                )
    
    async def verify_transaction(self, reference: str) -> Dict[str, Any]:
        """Verify a payment transaction."""
        if os.getenv("TESTING") == "true":
            if os.getenv("PAYSTACK_TEST_MODE") == "success":
                return {
                    "status": "success",
                    "reference": reference,
                    "channel": "test",
                }
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Payment service unavailable",
            )
        async with httpx.AsyncClient() as client:
            try:
                response = await client.get(
                    f"{self.BASE_URL}/transaction/verify/{reference}",
                    headers=self.headers
                )
                response.raise_for_status()
                data = response.json()
                
                if not data.get("status"):
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail="Transaction verification failed"
                    )
                
                return data["data"]
            
            except httpx.HTTPError as e:
                raise HTTPException(
                    status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                    detail=f"Payment verification error: {str(e)}"
                )
    
    def validate_webhook(self, signature: str, payload: bytes) -> bool:
        """Validate Paystack webhook signature."""
        import hmac
        import hashlib
        
        expected_signature = hmac.new(
            self.secret_key.encode('utf-8'),
            payload,
            hashlib.sha512
        ).hexdigest()
        
        return hmac.compare_digest(expected_signature, signature)


paystack_service = PaystackService()
