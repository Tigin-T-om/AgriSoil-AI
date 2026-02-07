from pydantic_settings import BaseSettings
from typing import List
import os


class Settings(BaseSettings):
    PROJECT_NAME: str = "AgriSoil AI E-commerce API"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    
    # Database settings
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL", 
        "sqlite:///./agrisoil.db"
    )
    
    # JWT settings
    SECRET_KEY: str = os.getenv(
        "SECRET_KEY",
        "your-secret-key-change-this-in-production-use-env-variable"
    )
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # CORS settings
    CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://localhost:5173",  # Vite default port
        "http://127.0.0.1:5173",
        "http://localhost:5174",  # Alternative Vite port
    ]
    
    # For development, you can use ["*"] to allow all origins
    # CORS_ORIGINS: List[str] = ["*"]  # Uncomment for development only
    
    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()
