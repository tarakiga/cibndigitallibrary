from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.db.session import get_db
from app.models import ContentProgress, User, Content
from app.schemas.content_progress import ContentProgressCreate, ContentProgressUpdate, ContentProgressResponse
from app.api.dependencies import get_current_user_dependency

router = APIRouter(prefix="/progress", tags=["Progress"])


@router.get("/", response_model=List[ContentProgressResponse])
def get_my_progress(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_dependency)
):
    """
    Get all content progress for the current user.
    """
    progress_list = db.query(ContentProgress).filter(
        ContentProgress.user_id == current_user.id
    ).all()
    return progress_list


@router.get("/{content_id}", response_model=ContentProgressResponse)
def get_content_progress(
    content_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_dependency)
):
    """
    Get progress for a specific content item.
    """
    progress = db.query(ContentProgress).filter(
        ContentProgress.user_id == current_user.id,
        ContentProgress.content_id == content_id
    ).first()
    
    if not progress:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No progress found for this content"
        )
    
    return progress


@router.post("/", response_model=ContentProgressResponse, status_code=status.HTTP_201_CREATED)
def create_or_update_progress(
    progress_data: ContentProgressCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_dependency)
):
    """
    Create or update content progress.
    """
    # Verify content exists
    content = db.query(Content).filter(Content.id == progress_data.content_id).first()
    if not content:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Content not found"
        )
    
    # Check if progress already exists
    existing_progress = db.query(ContentProgress).filter(
        ContentProgress.user_id == current_user.id,
        ContentProgress.content_id == progress_data.content_id
    ).first()
    
    if existing_progress:
        # Update existing progress
        existing_progress.playback_position = progress_data.playback_position
        existing_progress.total_duration = progress_data.total_duration
        existing_progress.progress_percentage = progress_data.progress_percentage
        existing_progress.is_completed = progress_data.is_completed
        db.commit()
        db.refresh(existing_progress)
        return existing_progress
    else:
        # Create new progress
        new_progress = ContentProgress(
            user_id=current_user.id,
            content_id=progress_data.content_id,
            playback_position=progress_data.playback_position,
            total_duration=progress_data.total_duration,
            progress_percentage=progress_data.progress_percentage,
            is_completed=progress_data.is_completed
        )
        db.add(new_progress)
        db.commit()
        db.refresh(new_progress)
        return new_progress


@router.patch("/{content_id}", response_model=ContentProgressResponse)
def update_progress(
    content_id: int,
    progress_data: ContentProgressUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_dependency)
):
    """
    Update progress for a specific content item.
    """
    progress = db.query(ContentProgress).filter(
        ContentProgress.user_id == current_user.id,
        ContentProgress.content_id == content_id
    ).first()
    
    if not progress:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No progress found for this content"
        )
    
    # Update fields
    for field, value in progress_data.dict(exclude_unset=True).items():
        setattr(progress, field, value)
    
    db.commit()
    db.refresh(progress)
    return progress


@router.delete("/{content_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_progress(
    content_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_dependency)
):
    """
    Delete progress for a specific content item.
    """
    progress = db.query(ContentProgress).filter(
        ContentProgress.user_id == current_user.id,
        ContentProgress.content_id == content_id
    ).first()
    
    if not progress:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No progress found for this content"
        )
    
    db.delete(progress)
    db.commit()
