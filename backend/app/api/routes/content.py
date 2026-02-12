from fastapi import APIRouter, Depends, HTTPException, status, Query, UploadFile, File
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import Optional, List
from app.db.session import get_db
from app.schemas import ContentCreate, ContentUpdate, ContentResponse, ContentListResponse
from app.models import Content, ContentType, ContentCategory, User, UserRole, Purchase
from app.api.dependencies import get_current_user_dependency, require_admin
import os
import shutil
from pathlib import Path
from app.core.config import settings
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/content", tags=["Content"])

@router.get("/public", response_model=ContentListResponse)
def list_public_content(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    content_type: Optional[ContentType] = None,
    category: Optional[ContentCategory] = None,
    search: Optional[str] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    db: Session = Depends(get_db),
):
    query = db.query(Content).filter(Content.is_active == True, Content.is_exclusive == False)
    if content_type:
        query = query.filter(Content.content_type == content_type)
    if category:
        query = query.filter(Content.category == category)
    if search:
        query = query.filter(Content.title.ilike(f"%{search}%"))
    if min_price is not None:
        query = query.filter(Content.price >= min_price)
    if max_price is not None:
        query = query.filter(Content.price <= max_price)
    total = query.count()
    offset = (page - 1) * page_size
    items = query.offset(offset).limit(page_size).all()
    items_with_counts = []
    for item in items:
        item_dict = ContentResponse.from_orm(item).dict()
        purchase_count = db.query(func.count(Purchase.id)).filter(Purchase.content_id == item.id).scalar()
        item_dict["purchase_count"] = purchase_count or 0
        items_with_counts.append(ContentResponse(**item_dict))
    return ContentListResponse(
        items=items_with_counts,
        total=total,
        page=page,
        page_size=page_size,
    )


@router.get("", response_model=ContentListResponse)
def list_content(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    content_type: Optional[ContentType] = None,
    category: Optional[ContentCategory] = None,
    search: Optional[str] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    include_inactive: bool = False,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_dependency)
):
    """List content with filtering and pagination."""
    query = db.query(Content)
    
    # Only allow admins to see inactive content
    if not (include_inactive and current_user.role == UserRole.ADMIN):
        query = query.filter(Content.is_active == True)
    
    # Filter exclusive content for non-CIBN members
    if current_user.role not in [UserRole.CIBN_MEMBER, UserRole.ADMIN]:
        query = query.filter(Content.is_exclusive == False)
    
    # Apply filters
    if content_type:
        query = query.filter(Content.content_type == content_type)
    if category:
        query = query.filter(Content.category == category)
    if search:
        query = query.filter(Content.title.ilike(f"%{search}%"))
    if min_price is not None:
        query = query.filter(Content.price >= min_price)
    if max_price is not None:
        query = query.filter(Content.price <= max_price)
    
    # Get total count
    total = query.count()
    
    # Paginate
    offset = (page - 1) * page_size
    items = query.offset(offset).limit(page_size).all()
    
    # Add purchase counts
    items_with_counts = []
    for item in items:
        item_dict = ContentResponse.from_orm(item).dict()
        purchase_count = db.query(func.count(Purchase.id)).filter(Purchase.content_id == item.id).scalar()
        item_dict['purchase_count'] = purchase_count or 0
        items_with_counts.append(ContentResponse(**item_dict))
    
    return ContentListResponse(
        items=items_with_counts,
        total=total,
        page=page,
        page_size=page_size
    )


@router.get("/{content_id}", response_model=ContentResponse)
def get_content(
    content_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_dependency)
):
    """Get a single content item by ID."""
    content = db.query(Content).filter(Content.id == content_id).first()
    
    if not content:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Content not found"
        )
    
    # Check if user has access to exclusive content
    if content.is_exclusive:
        if current_user.role not in [UserRole.CIBN_MEMBER, UserRole.ADMIN]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="CIBN membership required to access this content"
            )
        if current_user.role == UserRole.CIBN_MEMBER:
            if current_user.arrears and float(current_user.arrears) > 0:
                raise HTTPException(
                    status_code=status.HTTP_402_PAYMENT_REQUIRED,
                    detail=f"Please clear your outstanding arrears of ₦{float(current_user.arrears):,.2f} to access exclusive content. Visit https://portal.cibng.org/cb_login.asp to make payment."
                )
    
    # Add purchase count
    purchase_count = db.query(func.count(Purchase.id)).filter(Purchase.content_id == content.id).scalar()
    content_dict = ContentResponse.from_orm(content).dict()
    content_dict['purchase_count'] = purchase_count or 0
    
    return ContentResponse(**content_dict)


@router.post("", response_model=ContentResponse, status_code=status.HTTP_201_CREATED)
def create_content(
    content_data: ContentCreate,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin)
):
    """Create new content (admin only)."""
    content = Content(**content_data.dict())
    db.add(content)
    db.commit()
    db.refresh(content)
    return content


@router.patch("/{content_id}", response_model=ContentResponse)
def update_content(
    content_id: int,
    content_data: ContentUpdate,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin)
):
    """Update content (admin only)."""
    content = db.query(Content).filter(Content.id == content_id).first()
    
    if not content:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Content not found"
        )
    
    # Update fields
    for field, value in content_data.dict(exclude_unset=True).items():
        setattr(content, field, value)
    
    db.commit()
    db.refresh(content)
    return content


@router.delete("/{content_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_content(
    content_id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin)
):
    """Delete content (admin only)."""
    content = db.query(Content).filter(Content.id == content_id).first()
    
    if not content:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Content not found"
        )
    
    try:
        # Check if content has COMPLETED purchases
        purchase_count = db.query(func.count(Purchase.id)).filter(Purchase.content_id == content_id).scalar()
        if purchase_count > 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Cannot delete content with {purchase_count} purchases. Consider deactivating instead."
            )
        
        # Delete related OrderItems (pending/abandoned carts)
        db.query(OrderItem).filter(OrderItem.content_id == content_id).delete()
        
        # Delete related ContentProgress
        db.query(ContentProgress).filter(ContentProgress.content_id == content_id).delete()

        # Delete the content
        db.delete(content)
        db.commit()
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        logger.exception("Delete content failed", exc_info=e)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete content"
        )


@router.patch("/{content_id}/deactivate", response_model=ContentResponse)
def deactivate_content(
    content_id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin)
):
    """Deactivate content (admin only). Safer alternative to deletion."""
    content = db.query(Content).filter(Content.id == content_id).first()
    
    if not content:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Content not found"
        )
    
    content.is_active = False
    db.commit()
    db.refresh(content)
    return content
