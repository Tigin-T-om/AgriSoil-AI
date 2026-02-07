from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
from passlib.context import CryptContext
from passlib.exc import PasswordSizeError
from app.core.config import settings
import warnings

# Suppress bcrypt version warnings
warnings.filterwarnings("ignore", category=DeprecationWarning, module="passlib.handlers.bcrypt")

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a password against a hash"""
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
    """Hash a password"""
    # Validate password length before hashing (bcrypt has 72-byte limit)
    if not isinstance(password, str):
        raise ValueError("Password must be a string")
    
    password_bytes = password.encode('utf-8')
    password_byte_length = len(password_bytes)
    
    # Only check if password is actually too long
    if password_byte_length > 72:
        raise ValueError(f"Password is too long. Maximum length is 72 bytes, got {password_byte_length} bytes.")
    
    try:
        return pwd_context.hash(password)
    except PasswordSizeError as e:
        # This exception is specifically for password size issues
        error_msg = str(e)
        raise ValueError("Password is too long. Maximum length is 72 characters (bytes).") from e
    except Exception as e:
        # Re-raise other exceptions as-is to avoid masking real errors
        raise


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """Create a JWT access token"""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt


def decode_access_token(token: str) -> Optional[dict]:
    """Decode and verify a JWT token"""
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        return payload
    except JWTError:
        return None
