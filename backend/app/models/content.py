from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, Enum as SQLEnum, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum
from app.db.session import Base


class ContentType(str, enum.Enum):
    DOCUMENT = "document"
    VIDEO = "video"
    AUDIO = "audio"
    PHYSICAL = "physical"


class ContentCategory(str, enum.Enum):
    EXAM_TEXT = "exam_text"
    CIBN_PUBLICATION = "cibn_publication"
    RESEARCH_PAPER = "research_paper"
    STATIONERY = "stationery"
    SOUVENIR = "souvenir"
    OTHER = "other"


class Content(Base):
    __tablename__ = "contents"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False, index=True)
    description = Column(Text, nullable=True)
    content_type = Column(SQLEnum(ContentType), nullable=False, index=True)
    category = Column(SQLEnum(ContentCategory), nullable=False, index=True)
    price = Column(Float, nullable=False, default=0.0)
    file_url = Column(String, nullable=True)
    thumbnail_url = Column(String, nullable=True)
    file_size = Column(Integer, nullable=True)  # in bytes
    duration = Column(Integer, nullable=True)  # for audio/video in seconds
    is_exclusive = Column(Boolean, default=False)  # CIBN staff only
    is_active = Column(Boolean, default=True)
    stock_quantity = Column(Integer, nullable=True)  # for physical items
    author = Column(String, nullable=True)
    publisher = Column(String, nullable=True)
    publication_date = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    order_items = relationship("OrderItem", back_populates="content")
    purchases = relationship("Purchase", back_populates="content")
    user_progress = relationship("ContentProgress", back_populates="content", cascade="all, delete-orphan")
