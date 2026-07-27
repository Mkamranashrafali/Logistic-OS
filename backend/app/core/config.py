from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Optional

class Settings(BaseSettings):
    PROJECT_NAME: str = "LogistiCore API"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"

    # URLs & CORS
    FRONTEND_URL: str
    BACKEND_URL: str
    API_BASE_URL: str
    ALLOWED_ORIGINS: str

    # Cookies
    COOKIE_DOMAIN: str
    COOKIE_SECURE: bool = True

    # Database
    DATABASE_URL: str

    # JWT Authentication
    JWT_SECRET_KEY: str
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60

    # SMTP Email (Required for production sender)
    SMTP_HOST: Optional[str] = None
    SMTP_PORT: Optional[int] = None
    SMTP_EMAIL: str
    SMTP_PASSWORD: Optional[str] = None

    # Email Verification (Plunk)
    PLUNK_SECRET_KEY: str

    # Google OAuth
    GOOGLE_CLIENT_ID: str
    GOOGLE_CLIENT_SECRET: str

    model_config = SettingsConfigDict(env_file=".env", env_ignore_empty=True, extra="ignore")

settings = Settings()
