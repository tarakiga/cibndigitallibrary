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
    DATABASE_URL: str = os.getenv("DATABASE_URL") or "postgresql://user:password@localhost/db"
    
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        # Debug: print actual DATABASE_URL being used
        print(f"[CONFIG] DATABASE_URL: {self.DATABASE_URL[:50]}...")

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
    
    # Email settings
    SMTP_TLS: bool = os.getenv("SMTP_TLS", "true").lower() == "true"
    SMTP_PORT: int = int(os.getenv("SMTP_PORT", "587"))
    SMTP_HOST: str = os.getenv("SMTP_HOST", "smtp.gmail.com")
    SMTP_USER: str = os.getenv("SMTP_USER", "")
    SMTP_PASSWORD: str = os.getenv("SMTP_PASSWORD", "")
    EMAILS_FROM_EMAIL: str = os.getenv("EMAILS_FROM_EMAIL", "noreply@cibn.org")
    EMAILS_FROM_NAME: str = os.getenv("EMAILS_FROM_NAME", "CIBN Digital Library")
    
    # Password reset settings
    PASSWORD_RESET_TOKEN_EXPIRE_HOURS: int = 24

settings = Settings()
