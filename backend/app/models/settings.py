from sqlalchemy import Column, Integer, String, DateTime
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