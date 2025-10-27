from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from app.models.order import OrderStatus


class OrderItemCreate(BaseModel):
    content_id: int
    quantity: int = 1


class OrderItemResponse(BaseModel):
    id: int
    content_id: int
    quantity: int
    price_at_purchase: float
    
    class Config:
        from_attributes = True


class OrderCreate(BaseModel):
    items: List[OrderItemCreate]
    shipping_address: Optional[str] = None
    notes: Optional[str] = None


class OrderResponse(BaseModel):
    id: int
    user_id: int
    total_amount: float
    status: OrderStatus
    payment_reference: Optional[str]
    payment_method: Optional[str]
    shipping_address: Optional[str]
    notes: Optional[str]
    created_at: datetime
    updated_at: Optional[datetime]
    completed_at: Optional[datetime]
    items: List[OrderItemResponse]
    
    class Config:
        from_attributes = True


class PaystackInitializeResponse(BaseModel):
    authorization_url: str
    access_code: str
    reference: str


class PaystackWebhook(BaseModel):
    event: str
    data: dict
