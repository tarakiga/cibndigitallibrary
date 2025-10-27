import os
import sys
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv
from tabulate import tabulate

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

def list_all_content():
    """List all content items in the database"""
    db = get_db_connection()
    try:
        # First, get all content items with purchase count
        content_query = """
        SELECT 
            c.id, 
            c.title, 
            c.file_url, 
            c.content_type, 
            c.price, 
            c.is_active,
            COUNT(p.id) as purchase_count
        FROM contents c
        LEFT JOIN purchases p ON c.id = p.content_id
        GROUP BY c.id
        ORDER BY c.id
        """
        
        content_items = db.execute(text(content_query)).fetchall()
        
        if not content_items:
            print("No content items found in the database.")
            return
        
        # Prepare data for display
        print("\n=== Available Content ===")
        print("ID  | Title                              | Type      | Price   | Active | Purchases | File")
        print("----|------------------------------------|-----------|---------|--------|-----------|-----------------")
        
        for item in content_items:
            content_id = item[0]
            title = (item[1][:30] + '...') if item[1] and len(item[1]) > 30 else (item[1] or "N/A")
            content_type = item[3] or "N/A"
            price = f"${item[4]:.2f}" if item[4] is not None else "Free"
            is_active = "Yes" if item[5] else "No"
            purchase_count = item[6]
            file_url = item[2] or "No file"
            
            # Truncate file URL if too long
            if len(file_url) > 30:
                file_url = "..." + file_url[-27:]
                
            print(f"{content_id:<3} | {title:<34} | {content_type:<9} | {price:<7} | {is_active:<6} | {purchase_count:<9} | {file_url}")
        
        # Also show a summary
        print(f"\nTotal content items: {len(content_items)}")
        
    except Exception as e:
        print(f"Error listing content: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    # Install required package if not already installed
    try:
        from tabulate import tabulate
    except ImportError:
        print("Installing required package: tabulate")
        import subprocess
        subprocess.check_call([sys.executable, "-m", "pip", "install", "tabulate"])
        from tabulate import tabulate
    
    list_all_content()
