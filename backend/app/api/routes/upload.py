from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Request
from fastapi.responses import JSONResponse
from typing import Optional
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.api.dependencies import require_admin
from app.models import User
from app.core.config import settings
import os
import shutil
from pathlib import Path
import uuid
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/upload", tags=["Upload"])

def get_file_type(filename: str, allowed_extensions: dict[str, list[str]]) -> Optional[str]:
    """Determine file type based on extension."""
    ext = Path(filename).suffix.lower()
    for file_type, extensions in allowed_extensions.items():
        if ext in set(extensions):
            return file_type
    return None


@router.post("/file")
async def upload_file(
    request: Request,
    file: UploadFile = File(...),
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db)  # Inject DB session
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
        
        allowed_extensions = settings.UPLOAD_ALLOWED_EXTENSIONS
        
        # Fetch max sizes from DB (Upload Settings)
        from app.models.settings import UploadSettings
        upload_settings = db.query(UploadSettings).first()
        
        if upload_settings:
            # Use DB settings if available
            # Note: DB stores None for unlimited, logic below handles None as unlimited if we adapt it.
            # Existing logic: get(type, default). If we want None to match DB semantics?
            # Config default has None for video/audio.
            max_file_sizes = {
                "document": upload_settings.max_file_size_document,
                "video": upload_settings.max_file_size_video,
                "audio": upload_settings.max_file_size_audio,
                "image": upload_settings.max_file_size_image
            }
        else:
            # Fallback to env/file config
            max_file_sizes = settings.UPLOAD_MAX_FILE_SIZES

        file_type = get_file_type(file.filename, allowed_extensions)
        if not file_type:
            all_exts = sorted({ext for exts in allowed_extensions.values() for ext in exts})
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"File type not supported. Allowed extensions: {', '.join(all_exts)}"
            )
        
        # Check file size
        file.file.seek(0, 2)  # Seek to end
        file_size = file.file.tell()
        file.file.seek(0)  # Seek back to start
        
        # Get max size
        # If type not in dict, default to 50MB (safe fallback)
        # If key exists but value is None (unlimited), max_size becomes None
        max_size = max_file_sizes.get(file_type)
        if max_size is None and file_type not in max_file_sizes:
             # If key missing entirely, use 50MB fallback for safety, unless strict. 
             # But here we populated dictionary fully from DB model fields which are nullable.
             # If DB has None, it means unlimited.
             # If config has missing key? Config defaults are comprehensive.
             pass
             
        # Use a safe default for unknown types if dictionary lookups fail to return a value (key missing)
        # But max_file_sizes has keys "document", "video", etc.
        # If file_type is valid but key missing?
        if file_type not in max_file_sizes:
             max_size = 50 * 1024 * 1024 # 50MB default default
        else:
             max_size = max_file_sizes[file_type]

        if max_size is not None and file_size > max_size:
            raise HTTPException(
                status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                detail=f"File too large. Maximum size for {file_type}: {max_size / 1024 / 1024:.2f}MB"
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
        
        base_url = (settings.UPLOAD_BASE_URL or str(request.base_url)).rstrip("/")
        file_url = f"{base_url}/uploads/{unique_filename}"
        
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
        logger.exception("Upload failed", exc_info=e)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to upload file"
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
        logger.exception("Delete upload failed", exc_info=e)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete file"
        )
