from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class ContentProgressBase(BaseModel):
    content_id: int
    playback_position: float
    total_duration: Optional[float] = None
    progress_percentage: float
    is_completed: bool = False


class ContentProgressCreate(ContentProgressBase):
    pass


class ContentProgressUpdate(BaseModel):
    playback_position: Optional[float] = None
    total_duration: Optional[float] = None
    progress_percentage: Optional[float] = None
    is_completed: Optional[bool] = None


class ContentProgressResponse(ContentProgressBase):
    id: int
    user_id: int
    last_watched: datetime
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True
