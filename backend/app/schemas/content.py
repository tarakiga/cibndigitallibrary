from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from app.models.content import ContentType, ContentCategory


class ContentBase(BaseModel):
    title: str
    description: Optional[str] = None
    content_type: ContentType
    category: ContentCategory
    price: float
    is_exclusive: bool = False
    author: Optional[str] = None
    publisher: Optional[str] = None


class ContentCreate(ContentBase):
    file_url: Optional[str] = None
    thumbnail_url: Optional[str] = None
    file_size: Optional[int] = None
    duration: Optional[int] = None
    stock_quantity: Optional[int] = None


class ContentUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    content_type: Optional[ContentType] = None
    category: Optional[ContentCategory] = None
    price: Optional[float] = None
    is_exclusive: Optional[bool] = None
    is_active: Optional[bool] = None
    stock_quantity: Optional[int] = None
    file_url: Optional[str] = None
    thumbnail_url: Optional[str] = None


class ContentResponse(ContentBase):
    id: int
    file_url: Optional[str]
    thumbnail_url: Optional[str]
    file_size: Optional[int]
    duration: Optional[int]
    is_active: bool
    stock_quantity: Optional[int] = None
    purchase_count: Optional[int] = 0
    publication_date: Optional[datetime]
    created_at: datetime
    updated_at: Optional[datetime]
    
    class Config:
        from_attributes = True


class ContentListResponse(BaseModel):
    items: list[ContentResponse]
    total: int
    page: int
    page_size: int
