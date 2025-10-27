import os
import sys
from sqlalchemy import create_engine
from sqlalchemy_utils import database_exists, create_database
from sqlalchemy.exc import OperationalError

def setup_database():
    # Database configuration
    db_config = {
        'user': 'postgres',  # Default superuser
        'password': 'postgres',  # Default password, change if different
        'host': 'localhost',
        'port': '5432',
        'database': 'cibn_library'
    }
    
    # Create connection string for superuser
    superuser_url = f"postgresql://{db_config['user']}:{db_config['password']}@{db_config['host']}:{db_config['port']}/postgres"
    
    try:
        # Connect to PostgreSQL server
        engine = create_engine(superuser_url)
        conn = engine.connect()
        conn.execute("COMMIT")
        
        # Create database if it doesn't exist
        if not database_exists(f"postgresql://{db_config['user']}:{db_config['password']}@{db_config['host']}:{db_config['port']}/{db_config['database']}"):
            print(f"Creating database: {db_config['database']}")
            conn.execute(f"CREATE DATABASE {db_config['database']}")
        else:
            print(f"Database {db_config['database']} already exists.")
        
        # Create user if it doesn't exist
        result = conn.execute(
            "SELECT 1 FROM pg_roles WHERE rolname = %s", 
            (db_config['user'],)
        )
        
        if not result.fetchone():
            print(f"Creating user: {db_config['user']}")
            conn.execute(f"CREATE USER {db_config['user']} WITH PASSWORD '{db_config['password']}'")
            conn.execute(f"GRANT ALL PRIVILEGES ON DATABASE {db_config['database']} TO {db_config['user']}")
            conn.execute(f"ALTER USER {db_config['user']} CREATEDB")
            print(f"User {db_config['user']} created with all privileges on {db_config['database']}")
        else:
            print(f"User {db_config['user']} already exists.")
        
        conn.close()
        
        # Test connection with the new user
        user_url = f"postgresql://{db_config['user']}:{db_config['password']}@{db_config['host']}:{db_config['port']}/{db_config['database']}"
        engine = create_engine(user_url)
        conn = engine.connect()
        print(f"Successfully connected to {db_config['database']} as {db_config['user']}")
        conn.close()
        
        # Update .env file with the correct database URL
        with open('.env', 'r') as f:
            lines = f.readlines()
        
        with open('.env', 'w') as f:
            for line in lines:
                if line.startswith('DATABASE_URL'):
                    f.write(f'DATABASE_URL=postgresql://{db_config["user"]}:{db_config["password"]}@{db_config["host"]}:{db_config["port"]}/{db_config["database"]}\n')
                else:
                    f.write(line)
        
        print("Database setup completed successfully!")
        
    except OperationalError as e:
        print(f"Error connecting to the database: {e}")
        print("Please make sure PostgreSQL is running and the credentials are correct.")
        sys.exit(1)
    except Exception as e:
        print(f"An error occurred: {e}")
        sys.exit(1)

if __name__ == "__main__":
    setup_database()
