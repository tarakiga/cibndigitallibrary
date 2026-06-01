from sqlalchemy import Column, Integer, String, DateTime, Boolean
from sqlalchemy.sql import func
from app.db.session import Base


class PaymentSettings(Base):
    __tablename__ = "payment_settings"

    id = Column(Integer, primary_key=True, index=True)
    # 'test' or 'live'
    active_mode = Column(String, nullable=False, default="test")

    # Test keys
    test_public_key = Column(String, nullable=True)
    test_secret_key = Column(String, nullable=True)

    # Live keys
    live_public_key = Column(String, nullable=True)
    live_secret_key = Column(String, nullable=True)

    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())


class UploadSettings(Base):
    """Store configuration for file uploads."""
    __tablename__ = "upload_settings"

    id = Column(Integer, primary_key=True, index=True)
    
    # Max file sizes in bytes
    max_file_size_document = Column(Integer, default=524288000)  # Default 500MB
    max_file_size_video = Column(Integer, nullable=True)  # Null means unlimited
    max_file_size_audio = Column(Integer, nullable=True)
    max_file_size_image = Column(Integer, default=10485760)  # Default 10MB
    
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())


class EmailSettings(Base):
    """Store SMTP configuration for email sending (e.g., Microsoft 365)."""
    __tablename__ = "email_settings"

    id = Column(Integer, primary_key=True, index=True)
    
    # SMTP Server Configuration
    smtp_host = Column(String, nullable=True)  # e.g., smtp.office365.com
    smtp_port = Column(Integer, nullable=True, default=587)
    smtp_user = Column(String, nullable=True)  # email address for authentication
    smtp_password = Column(String, nullable=True)  # app password or OAuth token
    smtp_tls = Column(Boolean, nullable=True, default=True)
    
    # Email identity
    emails_from_email = Column(String, nullable=True)  # sender email address
    emails_from_name = Column(String, nullable=True, default="CIBN Digital Library")
    
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())