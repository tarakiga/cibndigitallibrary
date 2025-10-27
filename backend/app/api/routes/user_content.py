import os
import logging
from fastapi import APIRouter, Depends, HTTPException, status, Response
from fastapi.responses import FileResponse, StreamingResponse
import mimetypes

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)
from sqlalchemy.orm import Session
from typing import List
from pathlib import Path
from app.db.session import get_db
from app.models import Content, User, Purchase
from app.schemas import ContentResponse
from app.api.dependencies import get_current_user_dependency
from app.core.config import settings

router = APIRouter(prefix="/content/me", tags=["User Content"])

@router.get("/purchased", response_model=List[ContentResponse])
async def get_purchased_content(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_dependency)
):
    """
    Get all content purchased by the current user.
    """
    # Get all purchases for the current user
    purchases = db.query(Purchase).filter(
        Purchase.user_id == current_user.id
    ).all()
    
    # Extract content IDs from purchases
    content_ids = [purchase.content_id for purchase in purchases]
    
    if not content_ids:
        return []
    
    # Get all content that the user has purchased
    content_items = db.query(Content).filter(
        Content.id.in_(content_ids)
    ).all()
    
    return content_items

@router.get("/{content_id}/download")
async def download_purchased_content(
    content_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_dependency)
):
    """
    Download a purchased content file.
    """
    try:
        logger.info(f"Download request for content ID: {content_id} from user: {current_user.id}")
        
        # Check if the user has purchased this content
        purchase = db.query(Purchase).filter(
            Purchase.user_id == current_user.id,
            Purchase.content_id == content_id
        ).first()
        
        if not purchase:
            logger.warning(f"User {current_user.id} attempted to download unpurchased content {content_id}")
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You have not purchased this content"
            )
        
        # Get the content using SQLAlchemy model
        content = db.query(Content).filter(Content.id == content_id).first()
        if not content:
            logger.error(f"Content not found: {content_id}")
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Content not found"
            )
            
        if not content.file_url:
            logger.error(f"Content {content_id} has no file_url")
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="File not available for this content"
            )
        
        # Extract filename from URL (content.file_url is full URL like http://localhost:8000/uploads/filename.ext)
        filename = content.file_url.split('/')[-1] if content.file_url else ''
        if not filename:
            logger.error(f"Could not extract filename from URL: {content.file_url}")
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Invalid file URL"
            )
        
        # Construct the full file path
        file_path = Path(settings.UPLOAD_DIR) / filename
        logger.info(f"Looking for file at path: {file_path}")
        
        # Verify the file exists
        if not file_path.exists():
            logger.error(f"File not found at path: {file_path}")
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="File not found on server"
            )
        
        try:
            # Get file size for the Content-Length header
            file_size = file_path.stat().st_size
            logger.info(f"File size: {file_size} bytes")
            
            # Guess the MIME type based on file extension
            mime_type, _ = mimetypes.guess_type(file_path)
            logger.info(f"Detected MIME type: {mime_type}")
            
            # Create a FileResponse with appropriate headers
            response = FileResponse(
                str(file_path),
                media_type=mime_type or "application/octet-stream",
                filename=os.path.basename(content.file_url),
                headers={
                    "Content-Disposition": f"attachment; filename={os.path.basename(content.file_url)}",
                    "Content-Length": str(file_size),
                    "Access-Control-Expose-Headers": "Content-Disposition, Content-Length, Content-Type"
                }
            )
            
            logger.info("File response prepared successfully")
            return response
            
        except Exception as e:
            logger.error(f"Error creating file response: {str(e)}", exc_info=True)
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Error preparing file for download: {str(e)}"
            )
        
    except HTTPException as he:
        # Re-raise HTTP exceptions with their original status codes
        logger.error(f"HTTP Exception: {he.status_code} - {he.detail}")
        raise
        
    except Exception as e:
        # Log unexpected errors and return a 500 response
        logger.error(f"Unexpected error in download endpoint: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An unexpected error occurred while processing your request"
        )
