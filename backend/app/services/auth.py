from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from datetime import timedelta
from app.models.user import User
from app.schemas.user import UserCreate, UserLogin
from app.core.security import verify_password, get_password_hash, create_access_token
from app.core.config import settings


class AuthService:
    @staticmethod
    def register_user(db: Session, user_data: UserCreate) -> User:
        """Register a new user"""
        # Check if username already exists
        if db.query(User).filter(User.username == user_data.username).first():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Username already registered"
            )
        
        # Check if email already exists
        if db.query(User).filter(User.email == user_data.email).first():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )
        
        # Validate password length (bcrypt has 72-byte limit)
        # Check both character length (for user-friendly message) and byte length (for bcrypt)
        password_bytes = user_data.password.encode('utf-8')
        if len(password_bytes) > 72:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Password is too long. Maximum length is 72 characters (bytes)."
            )
        
        # Create new user
        # get_password_hash will also validate, but we validate here first for better error messages
        try:
            hashed_password = get_password_hash(user_data.password)
        except ValueError as e:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=str(e)
            )
        db_user = User(
            email=user_data.email,
            username=user_data.username,
            full_name=user_data.full_name,
            phone_number=user_data.phone_number,
            hashed_password=hashed_password
        )
        
        db.add(db_user)
        db.commit()
        db.refresh(db_user)
        return db_user

    @staticmethod
    def authenticate_user(db: Session, username: str, password: str) -> User:
        """Authenticate user and return user object"""
        user = db.query(User).filter(User.username == username).first()
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect username or password"
            )
        
        if not verify_password(password, user.hashed_password):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect username or password"
            )
        
        if not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Inactive user"
            )
        
        return user

    @staticmethod
    def create_access_token_for_user(user: User) -> str:
        """Create JWT access token for user"""
        access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        return create_access_token(
            data={"sub": user.username},
            expires_delta=access_token_expires
        )
