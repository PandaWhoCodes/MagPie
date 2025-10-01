from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    """Application settings"""

    # Application
    APP_NAME: str = "Build2Learn Registration"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = False

    # Database
    TURSO_DATABASE_URL: str
    TURSO_AUTH_TOKEN: str

    # CORS
    FRONTEND_URL: str = "http://localhost:3000"

    class Config:
        env_file = ".env"
        case_sensitive = True


@lru_cache()
def get_settings() -> Settings:
    """Get cached settings instance"""
    return Settings()
