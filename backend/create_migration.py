import os
import sys
from alembic.config import Config
from alembic import command

def create_migration():
    # Get the base directory
    base_dir = os.path.dirname(os.path.abspath(__file__))
    
    # Set up Alembic configuration
    alembic_cfg = Config(os.path.join(base_dir, "alembic.ini"))
    
    # Set the migration directory
    alembic_cfg.set_main_option('script_location', os.path.join(base_dir, 'alembic'))
    
    # Generate the migration
    command.revision(alembic_cfg, autogenerate=True, message="Initial migration")
    
    print("Migration created successfully!")

if __name__ == "__main__":
    create_migration()
