
import logging
from sqlalchemy import text
from app.db.session import SessionLocal

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def create_upload_settings_table():
    db = SessionLocal()
    try:
        logger.info("Checking for 'upload_settings' table...")
        
        # Check if table exists
        result = db.execute(text("SELECT to_regclass('public.upload_settings')")).scalar()
        
        if result:
            logger.info("Table 'upload_settings' already exists.")
        else:
            logger.info("Table 'upload_settings' does not exist. Creating...")
            
            # Simple CREATE TABLE statement matching the model
            # id SERIAL PRIMARY KEY, max_file_size_document INTEGER DEFAULT 524288000, ...
            sql = """
            CREATE TABLE IF NOT EXISTS upload_settings (
                id SERIAL PRIMARY KEY,
                max_file_size_document INTEGER DEFAULT 524288000,
                max_file_size_video INTEGER,
                max_file_size_audio INTEGER,
                max_file_size_image INTEGER DEFAULT 10485760,
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
            );
            """
            db.execute(text(sql))
            db.commit()
            logger.info("Table 'upload_settings' created successfully.")
            
    except Exception as e:
        logger.error(f"Error creating table: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    create_upload_settings_table()
