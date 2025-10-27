import os
import sys
from sqlalchemy import create_engine, text, inspect
from sqlalchemy.orm import sessionmaker
from sqlalchemy.ext.declarative import declarative_base
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

def get_db_connection():
    """Create a database connection using the DATABASE_URL from .env"""
    database_url = os.getenv("DATABASE_URL")
    if not database_url:
        print("Error: DATABASE_URL not found in .env file")
        sys.exit(1)
        
    try:
        engine = create_engine(database_url)
        SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
        return SessionLocal()
    except Exception as e:
        print(f"Error connecting to database: {e}")
        sys.exit(1)

def list_tables():
    """List all tables in the database"""
    db = get_db_connection()
    try:
        inspector = inspect(db.bind)
        tables = inspector.get_table_names()
        print("\n=== Database Tables ===")
        if tables:
            for table in tables:
                print(f"- {table}")
        else:
            print("No tables found in the database.")
            
        # If content table exists, show its columns
        if 'content' in tables:
            print("\n=== Content Table Structure ===")
            columns = inspector.get_columns('content')
            for column in columns:
                print(f"- {column['name']} ({column['type']})")
    except Exception as e:
        print(f"Error listing tables: {e}")
    finally:
        db.close()

def check_content(content_id: int):
    """Check content details for a given content_id"""
    db = get_db_connection()
    try:
        # Check if contents table exists
        inspector = inspect(db.bind)
        if 'contents' not in inspector.get_table_names():
            print("❌ The 'contents' table does not exist in the database.")
            print("\nPlease run the database migrations to create the required tables.")
            print("You can do this by running: 'alembic upgrade head'")
            return
            
        # Using raw SQL for simplicity
        result = db.execute(
            text("""
            SELECT id, title, file_url, created_at, updated_at 
            FROM contents 
            WHERE id = :content_id
            """),
            {"content_id": content_id}
        ).fetchone()
        
        if not result:
            print(f"No content found with ID: {content_id}")
            return
            
        print("\n=== Content Details ===")
        print(f"ID: {result[0]}")
        print(f"Title: {result[1]}")
        print(f"File URL: {result[2]}")
        print(f"Created At: {result[3]}")
        print(f"Updated At: {result[4]}")
        
        # Check if the file exists
        if result[2]:  # if file_url exists
            upload_dir = os.getenv("UPLOAD_DIR", "uploads")
            file_path = os.path.join(os.path.dirname(__file__), upload_dir, result[2])
            print(f"\n=== File Check ===")
            print(f"Looking for file at: {file_path}")
            
            if os.path.exists(file_path):
                print("✅ File exists!")
                print(f"File size: {os.path.getsize(file_path) / 1024:.2f} KB")
            else:
                print("❌ File not found!")
                
    except Exception as e:
        print(f"Error checking content: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    # First, list all tables in the database
    list_tables()
    
    # If a content_id is provided, check that content
    if len(sys.argv) == 2:
        try:
            content_id = int(sys.argv[1])
            check_content(content_id)
        except ValueError:
            print("Error: content_id must be an integer")
    else:
        print("\nTo check specific content, run: python check_content.py <content_id>")
