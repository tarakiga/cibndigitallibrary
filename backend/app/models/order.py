from sqlalchemy import Column, Integer, String, Float, DateTime, Enum as SQLEnum, ForeignKey, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum
from app.db.session import Base


class OrderStatus(str, enum.Enum):
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    CANCELLED = "cancelled"
    REFUNDED = "refunded"


class Order(Base):
    __tablename__ = "orders"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    total_amount = Column(Float, nullable=False)
    status = Column(SQLEnum(OrderStatus), default=OrderStatus.PENDING)
    payment_reference = Column(String, unique=True, nullable=True)
    payment_method = Column(String, nullable=True)
    shipping_address = Column(Text, nullable=True)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    completed_at = Column(DateTime(timezone=True), nullable=True)
    
    # Relationships
    user = relationship("User", back_populates="orders")
    items = relationship("OrderItem", back_populates="order", cascade="all, delete-orphan")


class OrderItem(Base):
    __tablename__ = "order_items"
    
    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("orders.id"), nullable=False)
    content_id = Column(Integer, ForeignKey("contents.id"), nullable=False)
    quantity = Column(Integer, default=1)
    price_at_purchase = Column(Float, nullable=False)
    
    # Relationships
    order = relationship("Order", back_populates="items")
    content = relationship("Content", back_populates="order_items")


class Purchase(Base):
    __tablename__ = "purchases"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    content_id = Column(Integer, ForeignKey("contents.id"), nullable=False)
    purchase_date = Column(DateTime(timezone=True), server_default=func.now())
    access_count = Column(Integer, default=0)
    last_accessed = Column(DateTime(timezone=True), nullable=True)
    
    # Relationships
    user = relationship("User", back_populates="purchases")
    content = relationship("Content", back_populates="purchases")
