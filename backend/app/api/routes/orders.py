import json
import logging

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.orm import Session
from typing import List

from app.db.session import get_db
from app.schemas import OrderCreate, OrderResponse, PaystackInitializeResponse
from app.models import Order, User
from app.api.dependencies import get_current_user_dependency
from app.services.orders import order_service
from app.services.payment import paystack_service, resolve_active_secret_key

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/orders", tags=["Orders"])


@router.post("/webhook")
async def paystack_webhook(
    request: Request,
    db: Session = Depends(get_db),
):
    """Paystack webhook endpoint.

    Verifies the HMAC signature server-side and confirms the payment
    independently of the client-driven verify flow. Always returns 200 to
    acknowledge receipt once the signature is valid, so Paystack does not retry.
    """
    raw_body = await request.body()
    signature = request.headers.get("x-paystack-signature", "")

    secret_key = resolve_active_secret_key(db)
    if not signature or not paystack_service.validate_webhook(
        signature, raw_body, secret_key_override=secret_key
    ):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid webhook signature",
        )

    try:
        event = json.loads(raw_body.decode("utf-8"))
    except (ValueError, UnicodeDecodeError):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid webhook payload",
        )

    if event.get("event") == "charge.success":
        data = event.get("data") or {}
        reference = data.get("reference")
        amount = data.get("amount")
        if reference:
            try:
                order_service.confirm_order_from_webhook(db, reference, amount)
            except Exception:
                logger.exception("Failed to process Paystack webhook for reference %s", reference)

    return {"status": "ok"}


@router.post("", response_model=OrderResponse, status_code=status.HTTP_201_CREATED)
async def create_order(
    order_data: OrderCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_dependency)
):
    """Create a new order."""
    return order_service.create_order(db=db, user=current_user, order_data=order_data)


@router.post("/{order_id}/initialize-payment", response_model=PaystackInitializeResponse)
async def initialize_payment(
    order_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_dependency)
):
    """Initialize Paystack payment for an order."""
    return await order_service.initialize_payment(db=db, user=current_user, order_id=order_id)


@router.post("/verify-payment/{reference}")
async def verify_payment(
    reference: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_dependency)
):
    """Verify payment and complete order."""
    return await order_service.verify_payment(db=db, user=current_user, reference=reference)


@router.get("", response_model=List[OrderResponse])
def get_my_orders(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_dependency)
):
    """Get all orders for current user."""
    orders = db.query(Order).filter(Order.user_id == current_user.id).all()
    return orders


@router.get("/{order_id}", response_model=OrderResponse)
def get_order(
    order_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_dependency)
):
    """Get a specific order."""
    order = db.query(Order).filter(
        Order.id == order_id,
        Order.user_id == current_user.id
    ).first()
    
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found"
        )
    
    return order
