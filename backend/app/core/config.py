import os
from typing import List, Union
from pydantic_settings import BaseSettings
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

class Settings(BaseSettings):
    PROJECT_NAME: str = "CIBN Digital Library API"
    VERSION: str = "0.1.0"
    API_V1_STR: str = "/api/v1"

    # Database settings
    DATABASE_URL: str = os.getenv("DATABASE_URL", "postgresql://user:password@localhost/db")

    # JWT settings
    SECRET_KEY: str = os.getenv("SECRET_KEY", "a_very_secret_key")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 # 1 day

    # CORS settings - load from env or use defaults
    @property
    def CORS_ORIGINS(self) -> List[str]:
        env_origins = os.getenv("CORS_ORIGINS")
        if env_origins:
            # Parse JSON array from env
            import json
            try:
                return json.loads(env_origins)
            except:
                pass
        # Default origins
        return [
            "http://localhost:3000",
            "http://localhost:3001",
            "http://localhost:3003",
            "http://localhost:3007",
            "http://127.0.0.1:3000",
            "http://127.0.0.1:3001",
            "http://127.0.0.1:3003",
            "http://127.0.0.1:3007",
        ]

    # File upload settings
    UPLOAD_DIR: str = "uploads"
    UPLOAD_FOLDER: str = os.path.join(os.getcwd(), "uploads")

    # CIBN Member external database credentials
    CIBN_DB_SERVER: str = os.getenv("CIBN_DB_SERVER", "localhost")
    CIBN_DB_DATABASE: str = os.getenv("CIBN_DB_DATABASE", "cibn_members")
    CIBN_DB_USERNAME: str = os.getenv("CIBN_DB_USERNAME", "user")
    CIBN_DB_PASSWORD: str = os.getenv("CIBN_DB_PASSWORD", "password")
    
    # Paystack settings
    PAYSTACK_SECRET_KEY: str = os.getenv("PAYSTACK_SECRET_KEY", "")
    FRONTEND_URL: str = os.getenv("FRONTEND_URL", "http://localhost:3001")

settings = Settings()