import os
import sys
from sqlalchemy import create_engine
from sqlalchemy_utils import database_exists, create_database
from alembic.config import Config
from alembic import command

def init_database():
    # Get database URL from environment or use default
    db_url = os.getenv("DATABASE_URL", "postgresql://cibn_user:Valerian101!@localhost:5432/cibn_library")
    
    # Create engine
    engine = create_engine(db_url)
    
    # Create database if it doesn't exist
    if not database_exists(engine.url):
        print(f"Creating database: {engine.url.database}")
        create_database(engine.url)
        print("Database created successfully!")
    else:
        print(f"Database {engine.url.database} already exists.")
    
    # Run migrations
    print("Running database migrations...")
    try:
        # Get the directory of the current script
        base_dir = os.path.dirname(os.path.abspath(__file__))
        # Set up Alembic configuration
        alembic_cfg = Config(os.path.join(base_dir, "alembic.ini"))
        # Set the migration directory
        alembic_cfg.set_main_option('script_location', os.path.join(base_dir, 'alembic'))
        # Run migrations
        command.upgrade(alembic_cfg, 'head')
        print("Migrations applied successfully!")
    except Exception as e:
        print(f"Error running migrations: {str(e)}")
        sys.exit(1)

if __name__ == "__main__":
    init_database()
