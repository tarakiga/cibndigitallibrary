from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from fastapi.responses import JSONResponse
from typing import Optional
from app.api.dependencies import require_admin
from app.models import User
from app.core.config import settings
import os
import shutil
from pathlib import Path
import uuid

router = APIRouter(prefix="/upload", tags=["Upload"])

# Allowed file extensions
ALLOWED_EXTENSIONS = {
    'document': {'.pdf', '.doc', '.docx', '.txt', '.md'},
    'video': {'.mp4', '.webm', '.mov', '.avi', '.mkv'},
    'audio': {'.mp3', '.wav', '.ogg', '.m4a', '.aac'},
    'image': {'.jpg', '.jpeg', '.png', '.gif', '.webp'}
}

# Max file sizes (in bytes) - None means no limit
MAX_FILE_SIZES = {
    'document': 50 * 1024 * 1024,  # 50MB
    'video': None,                  # No limit for large video files
    'audio': None,                  # No limit for large audio files
    'image': 10 * 1024 * 1024       # 10MB
}


def get_file_type(filename: str) -> Optional[str]:
    """Determine file type based on extension."""
    ext = Path(filename).suffix.lower()
    for file_type, extensions in ALLOWED_EXTENSIONS.items():
        if ext in extensions:
            return file_type
    return None


@router.post("/file")
async def upload_file(
    file: UploadFile = File(...),
    admin: User = Depends(require_admin)
):
    """
    Upload a file to the server.
    Returns the file URL that can be used in content records.
    Admin only.
    """
    try:
        # Validate file
        if not file.filename:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No filename provided"
            )
        
        # Get file type
        file_type = get_file_type(file.filename)
        if not file_type:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"File type not supported. Allowed extensions: {', '.join(sum(ALLOWED_EXTENSIONS.values(), set()))}"
            )
        
        # Check file size
        file.file.seek(0, 2)  # Seek to end
        file_size = file.file.tell()
        file.file.seek(0)  # Seek back to start
        
        # Get max size (None means no limit)
        max_size = MAX_FILE_SIZES.get(file_type, 50 * 1024 * 1024)
        if max_size is not None and file_size > max_size:
            raise HTTPException(
                status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                detail=f"File too large. Maximum size for {file_type}: {max_size / 1024 / 1024}MB"
            )
        
        # Generate unique filename
        file_ext = Path(file.filename).suffix
        unique_filename = f"{uuid.uuid4()}{file_ext}"
        
        # Create uploads directory if it doesn't exist
        upload_dir = Path(settings.UPLOAD_DIR)
        upload_dir.mkdir(exist_ok=True)
        
        # Save file
        file_path = upload_dir / unique_filename
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        # Generate URL
        file_url = f"http://localhost:8000/uploads/{unique_filename}"
        
        return {
            "success": True,
            "filename": unique_filename,
            "original_filename": file.filename,
            "file_url": file_url,
            "file_type": file_type,
            "file_size": file_size,
            "message": "File uploaded successfully"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to upload file: {str(e)}"
        )


@router.delete("/file/{filename}")
async def delete_file(
    filename: str,
    admin: User = Depends(require_admin)
):
    """
    Delete an uploaded file.
    Admin only.
    """
    try:
        file_path = Path(settings.UPLOAD_DIR) / filename
        
        if not file_path.exists():
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="File not found"
            )
        
        # Delete file
        file_path.unlink()
        
        return {
            "success": True,
            "message": f"File {filename} deleted successfully"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete file: {str(e)}"
        )
