
import sys
import os
from sqlalchemy import create_engine, inspect

# Add backend directory to path if running from root
if os.path.exists('backend'):
    sys.path.append(os.path.join(os.getcwd(), 'backend'))

# Add current directory if running from backend
sys.path.append(os.getcwd())

from app.core.config import settings

def verify_tables():
    # Use the database URL from settings or environment
    database_url = None
    if hasattr(settings, 'SQLALCHEMY_DATABASE_URI'):
        database_url = settings.SQLALCHEMY_DATABASE_URI
    elif hasattr(settings, 'DATABASE_URL'):
        database_url = settings.DATABASE_URL
    else:
        # Fallback to env var
        database_url = os.getenv('DATABASE_URL')
        
    if not database_url:
        print("Database URL not found.")
        return

    try:
        engine = create_engine(database_url)
        inspector = inspect(engine)
        tables = inspector.get_table_names()
        
        print(f"Existing tables: {tables}")
        
        required_tables = ['payment_settings', 'email_settings']
        missing = [t for t in required_tables if t not in tables]
        
        if missing:
            print(f"MISSING tables: {missing}")
        else:
            print("All settings tables exist.")
            
    except Exception as e:
        print(f"Error connecting to DB: {e}")

if __name__ == "__main__":
    verify_tables()
