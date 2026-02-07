from pydantic import BaseModel, EmailStr, field_validator
from typing import Optional
from datetime import datetime


class UserBase(BaseModel):
    email: EmailStr
    username: str
    full_name: Optional[str] = None
    phone_number: Optional[str] = None


class UserCreate(UserBase):
    password: str

    @field_validator('password')
    @classmethod
    def validate_password_length(cls, v: str) -> str:
        """Validate password length (bcrypt has 72-byte limit)"""
        if not v:
            raise ValueError('Password is required')
        
        # Check minimum length first
        if len(v) < 6:
            raise ValueError('Password must be at least 6 characters long')
        
        # Check maximum byte length (bcrypt limit)
        password_bytes = v.encode('utf-8')
        byte_length = len(password_bytes)
        if byte_length > 72:
            raise ValueError(f'Password is too long. Maximum length is 72 bytes, got {byte_length} bytes.')
        
        return v


class UserLogin(BaseModel):
    username: str
    password: str


class UserResponse(UserBase):
    id: int
    is_active: bool
    is_admin: bool
    created_at: datetime

    class Config:
        from_attributes = True


class Token(BaseModel):
    access_token: str
    token_type: str


class TokenData(BaseModel):
    username: Optional[str] = None
