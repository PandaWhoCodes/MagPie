from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    """Application settings"""

    # Application
    APP_NAME: str = "MagPie Event Registration"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = False

    # Database
    TURSO_DATABASE_URL: str
    TURSO_AUTH_TOKEN: str

    # CORS
    FRONTEND_URL: str = "http://localhost:3000"

    # Twilio WhatsApp (Optional - only needed if using WhatsApp feature)
    TWILIO_ACCOUNT_SID: str = ""
    TWILIO_AUTH_TOKEN: str = ""
    TWILIO_WHATSAPP_NUMBER: str = "whatsapp:+14155238886"

    class Config:
        env_file = ".env"
        case_sensitive = True
        extra = "ignore"  # Ignore extra fields like CLERK_SECRET_KEY (frontend only)


@lru_cache()
def get_settings() -> Settings:
    """Get cached settings instance"""
    return Settings()
