from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    PROJECT_NAME: str = "Agri-Soil AI E-commerce API"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    
    # Database settings
    DATABASE_URL: str = "sqlite:///./agrisoil.db"
    
    # JWT settings
    SECRET_KEY: str = "your-secret-key-change-this-in-production-use-env-variable"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # Google OAuth
    GOOGLE_CLIENT_ID: str = "516962367203-2m1fajdnbks7sc5mu0mdt8bojsdnh8pl.apps.googleusercontent.com"
    
    # Twitter/X OAuth 2.0
    TWITTER_CLIENT_ID: str = "aDUtb3RDRFpyNlQzaHAxdzFjSTI6MTpjaQ"
    TWITTER_CLIENT_SECRET: str = "3wXaUMkzI7d_OL5Q3ptm65uO_wKloJTVFhVtIQVrZx35YrFI7E"
    TWITTER_REDIRECT_URI: str = "http://localhost:5173/auth/callback/twitter"
    
    # Razorpay Payment Gateway
    RAZORPAY_KEY_ID: str = "rzp_test_SGMUUmq88aWVnQ"
    RAZORPAY_KEY_SECRET: str = "NcIsBRqylVRC2I2KVwC7rHRT"
    
    # SMTP / Email settings (for OTP-based Forgot Password)
    SMTP_SERVER: str = "smtp.gmail.com"
    SMTP_PORT: int = 587
    SMTP_USERNAME: str = "tigintom158@gmail.com"
    SMTP_PASSWORD: str = "wrpcchsxlmccjvqv"
    EMAILS_FROM_EMAIL: str = "no-reply@agri-soil.ai"
    EMAILS_FROM_NAME: str = "Agri-Soil AI"
    
    # OTP settings
    OTP_EXPIRE_MINUTES: int = 10
    
    # CORS settings
    CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://localhost:5173",  # Vite default port
        "http://127.0.0.1:5173",
        "http://localhost:5174",  # Alternative Vite port
    ]
    
    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()
