from sqlalchemy import Column, Integer, Float, DateTime, ForeignKey, UniqueConstraint, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime
from app.db.session import Base


class ContentProgress(Base):
    """Track user progress for video and audio content"""
    __tablename__ = "content_progress"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    content_id = Column(Integer, ForeignKey("contents.id", ondelete="CASCADE"), nullable=False)
    
    # Progress tracking
    playback_position = Column(Float, default=0.0, nullable=False)  # Current position in seconds
    total_duration = Column(Float, nullable=True)  # Total duration in seconds
    progress_percentage = Column(Float, default=0.0, nullable=False)  # 0-100
    
    # Completion status
    is_completed = Column(Boolean, default=False, nullable=False)
    
    # Timestamps
    last_watched = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    
    # Relationships
    user = relationship("User", back_populates="content_progress")
    content = relationship("Content", back_populates="user_progress")
    
    # Ensure one progress record per user per content
    __table_args__ = (
        UniqueConstraint('user_id', 'content_id', name='uq_user_content_progress'),
    )
