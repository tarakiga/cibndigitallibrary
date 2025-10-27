from sqlalchemy import Column, Integer, String, Boolean, DateTime, Enum as SQLEnum, Numeric
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum
from app.db.session import Base


class UserRole(str, enum.Enum):
    SUBSCRIBER = "subscriber"
    CIBN_MEMBER = "cibn_member"
    ADMIN = "admin"


class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String, nullable=False)
    phone = Column(String, nullable=True)
    avatar_url = Column(String, nullable=True)
    role = Column(SQLEnum(UserRole), default=UserRole.SUBSCRIBER)
    cibn_employee_id = Column(String, unique=True, nullable=True, index=True)
    
    # CIBN Member specific fields (synced from remote DB)
    arrears = Column(Numeric(10, 2), nullable=True, default=0)  # Outstanding dues
    annual_subscription = Column(Numeric(10, 2), nullable=True, default=0)  # Annual subscription fee
    
    is_active = Column(Boolean, default=True)
    is_verified = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    orders = relationship("Order", back_populates="user")
    purchases = relationship("Purchase", back_populates="user")
    content_progress = relationship("ContentProgress", back_populates="user", cascade="all, delete-orphan")
