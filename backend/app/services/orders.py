from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from typing import List, Dict, Any, Optional
from datetime import datetime
import uuid
import logging

from app.models import Order, OrderItem, Content, User, OrderStatus, Purchase, PaymentSettings as _PS
from app.schemas import OrderCreate
from app.services.payment import paystack_service

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
        
        # Create order
        order = Order(
            user_id=user.id,
            total_amount=total_amount,
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
        
        # Verify with Paystack
        try:
            payment_data = await paystack_service.verify_transaction(reference)
        except HTTPException as exc:
            raise exc
        except Exception as e:
            logger.error(f"Paystack verification failed: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Payment verification failed"
            )
        
        if payment_data["status"] == "success":
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

order_service = OrderService()
