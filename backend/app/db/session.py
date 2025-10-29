from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from app.core.config import settings
import time
import logging

logger = logging.getLogger(__name__)

# Create engine with connection pool settings
engine = create_engine(
    settings.DATABASE_URL,
    pool_pre_ping=True,
    pool_size=5,
    max_overflow=10,
    pool_recycle=3600,
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def wait_for_db(max_retries=30, retry_interval=2):
    """Wait for database to be ready"""
    for attempt in range(max_retries):
        try:
            # Try to connect
            connection = engine.connect()
            connection.close()
            logger.info("Database connection established successfully")
            return True
        except Exception as e:
            logger.warning(f"Database connection attempt {attempt + 1}/{max_retries} failed: {e}")
            if attempt < max_retries - 1:
                time.sleep(retry_interval)
            else:
                logger.error("Failed to connect to database after maximum retries")
                raise
    return False


def get_db():
    """Dependency for getting database session."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
