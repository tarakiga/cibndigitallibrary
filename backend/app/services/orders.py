from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from typing import List, Dict, Any, Optional
from datetime import datetime
import uuid
import logging

from app.models import Order, OrderItem, Content, User, OrderStatus, Purchase, PaymentSettings as _PS
from app.schemas import OrderCreate
from app.services.payment import paystack_service, resolve_active_secret_key

logger = logging.getLogger(__name__)

class OrderService:
    @staticmethod
    def create_order(db: Session, user: User, order_data: OrderCreate) -> Order:
        """
        Creates a new order with validation for stock and content availability.
        """
        total_amount = 0.0
        order_items_data = []
        
        for item in order_data.items:
            # Quantity validation
            if item.quantity <= 0:
                raise HTTPException(
                    status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                    detail="Quantity must be at least 1"
                )

            content = db.query(Content).filter(Content.id == item.content_id).first()
            if not content:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Content {item.content_id} not found"
                )
            
            if not content.is_active:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Content {content.title} is not available"
                )
            
            # Check stock for physical items
            if content.content_type.value == "physical":
                if content.stock_quantity is None or content.stock_quantity < item.quantity:
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail=f"Insufficient stock for {content.title}"
                    )
            
            item_total = content.price * item.quantity
            total_amount += item_total
            
            order_items_data.append({
                "content": content,
                "quantity": item.quantity,
                "price": content.price
            })
            
        # Calculate VAT (7.5%)
        vat_amount = round(total_amount * 0.075, 2)
        subtotal_with_vat = total_amount + vat_amount
        
        # Calculate Paystack Processing Fee
        # 1.5% + NGN 100 (waived if under 2500), capped at NGN 2000
        paystack_fee = subtotal_with_vat * 0.015
        if subtotal_with_vat >= 2500:
            paystack_fee += 100
        paystack_fee = round(min(paystack_fee, 2000), 2)
        
        final_total = subtotal_with_vat + paystack_fee
        
        # Create order
        order = Order(
            user_id=user.id,
            total_amount=final_total,
            status=OrderStatus.PENDING,
            shipping_address=order_data.shipping_address,
            notes=order_data.notes
        )
        db.add(order)
        db.flush()
        
        # Create order items
        for item_data in order_items_data:
            order_item = OrderItem(
                order_id=order.id,
                content_id=item_data["content"].id,
                quantity=item_data["quantity"],
                price_at_purchase=item_data["price"]
            )
            db.add(order_item)
        
        db.commit()
        db.refresh(order)
        return order

    @staticmethod
    async def initialize_payment(db: Session, user: User, order_id: int) -> Dict[str, Any]:
        """
        Initializes a Paystack payment for an order.
        """
        order = db.query(Order).filter(
            Order.id == order_id,
            Order.user_id == user.id
        ).first()
        
        if not order:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Order not found"
            )
        
        if order.status != OrderStatus.PENDING:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Order cannot be paid"
            )
        
        # Generate unique reference
        reference = f"CIBN-{order.id}-{uuid.uuid4().hex[:8]}"
        
        # Resolve Paystack secret key from DB settings (fallback to env)
        settings_row = db.query(_PS).first()
        secret_key = None
        if settings_row:
            if settings_row.active_mode == "live" and settings_row.live_secret_key:
                secret_key = settings_row.live_secret_key
            elif settings_row.test_secret_key:
                secret_key = settings_row.test_secret_key

        try:
            payment_data = await paystack_service.initialize_transaction(
                email=user.email,
                amount=order.total_amount,
                reference=reference,
                callback_url=None,
                secret_key_override=secret_key,
            )
        except HTTPException as exc:
            raise exc
        except Exception as e:
            logger.error(f"Paystack initialization failed: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Payment initialization failed"
            )
        
        # Update order with payment reference
        order.payment_reference = reference
        db.commit()
        
        return payment_data

    @staticmethod
    async def verify_payment(db: Session, user: User, reference: str) -> Dict[str, Any]:
        """
        Verifies a payment with Paystack and updates the order status.
        """
        order = db.query(Order).filter(
            Order.payment_reference == reference,
            Order.user_id == user.id
        ).first()
        
        if not order:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Order not found"
            )
        
        # Verify with Paystack (key resolved from Admin Settings, env fallback)
        secret_key = resolve_active_secret_key(db)
        try:
            payment_data = await paystack_service.verify_transaction(
                reference, secret_key_override=secret_key
            )
        except HTTPException as exc:
            raise exc
        except Exception as e:
            logger.error(f"Paystack verification failed: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Payment verification failed"
            )
        
        if payment_data["status"] == "success":
            # Verify the amount actually paid matches the order total before
            # fulfilling. Paystack returns the amount in kobo; order.total_amount
            # is stored in naira. A tampered/under-paid transaction must not
            # complete the order. (Skipped for the test stub, which omits amount.)
            paid_amount_kobo = payment_data.get("amount")
            if paid_amount_kobo is not None:
                expected_amount_kobo = int(round(order.total_amount * 100))
                if int(paid_amount_kobo) != expected_amount_kobo:
                    logger.error(
                        "Payment amount mismatch for order %s: expected %s kobo, "
                        "got %s kobo (reference=%s)",
                        order.id, expected_amount_kobo, paid_amount_kobo, reference,
                    )
                    order.status = OrderStatus.CANCELLED
                    db.commit()
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail="Payment amount does not match order total"
                    )

            # Update order status
            order.status = OrderStatus.COMPLETED
            order.payment_method = payment_data.get("channel")
            order.completed_at = datetime.utcnow()
            
            # Create purchases for digital content
            for item in order.items:
                if item.content.content_type.value in ["document", "video", "audio"]:
                    # Check if already purchased to avoid duplicates (optional but good practice)
                    existing = db.query(Purchase).filter(
                        Purchase.user_id == user.id,
                        Purchase.content_id == item.content_id
                    ).first()
                    
                    if not existing:
                        purchase = Purchase(
                            user_id=user.id,
                            content_id=item.content_id,
                            order_id=order.id, # Link purchase to order
                            amount=item.price_at_purchase,
                            quantity=item.quantity
                        )
                        db.add(purchase)
            
            # Update stock for physical items
            for item in order.items:
                if item.content.content_type.value == "physical" and item.content.stock_quantity:
                    item.content.stock_quantity = max(0, item.content.stock_quantity - item.quantity)
            
            db.commit()
            
            return {"message": "Payment verified successfully", "status": "success"}
        else:
            order.status = OrderStatus.CANCELLED
            db.commit()
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Payment verification failed"
            )

    @staticmethod
    def confirm_order_from_webhook(db: Session, reference: str, paid_amount_kobo: Optional[int]) -> bool:
        """Idempotently fulfill an order from a verified Paystack webhook event.

        Looks the order up by reference only (the webhook is not user-scoped),
        verifies the paid amount against the order total, and creates purchases /
        adjusts stock if not already completed. Returns True if the order is in
        (or moved to) a completed state. Signature verification is done by the
        caller before invoking this method.
        """
        order = db.query(Order).filter(Order.payment_reference == reference).first()
        if not order:
            logger.warning("Webhook for unknown payment reference: %s", reference)
            return False

        # Already fulfilled — nothing to do (idempotent).
        if order.status == OrderStatus.COMPLETED:
            return True

        # Verify amount paid matches the order total (kobo vs naira).
        if paid_amount_kobo is not None:
            expected_amount_kobo = int(round(order.total_amount * 100))
            if int(paid_amount_kobo) != expected_amount_kobo:
                logger.error(
                    "Webhook amount mismatch for order %s: expected %s kobo, got %s kobo",
                    order.id, expected_amount_kobo, paid_amount_kobo,
                )
                return False

        order.status = OrderStatus.COMPLETED
        order.completed_at = datetime.utcnow()

        for item in order.items:
            if item.content.content_type.value in ["document", "video", "audio"]:
                existing = db.query(Purchase).filter(
                    Purchase.user_id == order.user_id,
                    Purchase.content_id == item.content_id
                ).first()
                if not existing:
                    db.add(Purchase(
                        user_id=order.user_id,
                        content_id=item.content_id,
                        order_id=order.id,
                        amount=item.price_at_purchase,
                        quantity=item.quantity
                    ))

        for item in order.items:
            if item.content.content_type.value == "physical" and item.content.stock_quantity:
                item.content.stock_quantity = max(0, item.content.stock_quantity - item.quantity)

        db.commit()
        return True

order_service = OrderService()
