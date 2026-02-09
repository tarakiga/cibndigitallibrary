import os
import json
from typing import List, Dict, Any
from pydantic_settings import BaseSettings
from dotenv import load_dotenv
from app.core.config_defaults import DEFAULT_UPLOAD_ALLOWED_EXTENSIONS, DEFAULT_UPLOAD_MAX_FILE_SIZES

load_dotenv()

class Settings(BaseSettings):
    PROJECT_NAME: str = "CIBN Digital Library API"
    VERSION: str = "0.1.0"
    API_V1_STR: str = "/api/v1"
    APP_ENV: str = os.getenv("APP_ENV") or os.getenv("NODE_ENV") or "development"

    DATABASE_URL: str | None = os.getenv("DATABASE_URL")

    SECRET_KEY: str | None = os.getenv("SECRET_KEY")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24

    UPLOAD_DIR: str = os.getenv("UPLOAD_DIR") or "uploads"
    UPLOAD_FOLDER: str = os.path.join(os.getcwd(), UPLOAD_DIR)
    UPLOAD_BASE_URL: str | None = os.getenv("UPLOAD_BASE_URL")

    CIBN_DB_SERVER: str | None = os.getenv("CIBN_DB_SERVER")
    CIBN_DB_DATABASE: str | None = os.getenv("CIBN_DB_DATABASE")
    CIBN_DB_USERNAME: str | None = os.getenv("CIBN_DB_USERNAME")
    CIBN_DB_PASSWORD: str | None = os.getenv("CIBN_DB_PASSWORD")
    VIEW_NAME: str | None = os.getenv("VIEW_NAME")

    PAYSTACK_SECRET_KEY: str | None = os.getenv("PAYSTACK_SECRET_KEY")
    FRONTEND_URL: str | None = os.getenv("FRONTEND_URL")

    SMTP_TLS: bool = (os.getenv("SMTP_TLS", "true").lower() == "true")
    SMTP_PORT: int = int(os.getenv("SMTP_PORT", "587"))
    SMTP_HOST: str = os.getenv("SMTP_HOST", "smtp.gmail.com")
    SMTP_USER: str | None = os.getenv("SMTP_USER")
    SMTP_PASSWORD: str | None = os.getenv("SMTP_PASSWORD")
    EMAILS_FROM_EMAIL: str = os.getenv("EMAILS_FROM_EMAIL", "noreply@cibn.org")
    EMAILS_FROM_NAME: str = os.getenv("EMAILS_FROM_NAME", "CIBN Digital Library")

    PASSWORD_RESET_TOKEN_EXPIRE_HOURS: int = 24

    _cors_origins: List[str] = []
    _upload_allowed_extensions: Dict[str, List[str]] = {}
    _upload_max_file_sizes: Dict[str, int | None] = {}

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self._cors_origins = self._parse_list(os.getenv("CORS_ORIGINS"))
        self._upload_allowed_extensions = self._parse_dict(
            os.getenv("UPLOAD_ALLOWED_EXTENSIONS_JSON"),
            DEFAULT_UPLOAD_ALLOWED_EXTENSIONS,
        )
        self._upload_max_file_sizes = self._parse_dict(
            os.getenv("UPLOAD_MAX_FILE_SIZES_JSON"),
            DEFAULT_UPLOAD_MAX_FILE_SIZES,
        )
        self._validate_required()

    def _parse_list(self, value: str | None) -> List[str]:
        if not value:
            return []
        try:
            data = json.loads(value)
            return data if isinstance(data, list) else []
        except Exception:
            return []

    def _parse_dict(self, value: str | None, fallback: Dict[str, Any]) -> Dict[str, Any]:
        if not value:
            return fallback
        try:
            data = json.loads(value)
            return data if isinstance(data, dict) else fallback
        except Exception:
            return fallback

    def _validate_required(self) -> None:
        is_test = os.getenv("TESTING") == "true"
        if is_test or self.APP_ENV in {"development", "test"}:
            return
        missing = []
        if not self.DATABASE_URL:
            missing.append("DATABASE_URL")
        if not self.SECRET_KEY:
            missing.append("SECRET_KEY")
        if not self.FRONTEND_URL:
            missing.append("FRONTEND_URL")
        if not self.PAYSTACK_SECRET_KEY:
            missing.append("PAYSTACK_SECRET_KEY")
        if not self._cors_origins:
            missing.append("CORS_ORIGINS")
        if missing:
            raise RuntimeError(f"Missing required environment settings: {', '.join(missing)}")

    @property
    def CORS_ORIGINS(self) -> List[str]:
        return self._cors_origins

    @property
    def UPLOAD_ALLOWED_EXTENSIONS(self) -> Dict[str, List[str]]:
        return self._upload_allowed_extensions

    @property
    def UPLOAD_MAX_FILE_SIZES(self) -> Dict[str, int | None]:
        return self._upload_max_file_sizes

settings = Settings()
