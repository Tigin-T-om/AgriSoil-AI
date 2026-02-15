from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.schemas.user import UserCreate, UserLogin, UserResponse, Token
from app.services.auth import AuthService
from app.dependencies.auth import get_current_active_user
from app.models.user import User
from app.core.config import settings
from app.core.security import get_password_hash, create_access_token
from pydantic import BaseModel
from datetime import timedelta
import secrets
import urllib.request
import json

router = APIRouter()


class GoogleToken(BaseModel):
    credential: str


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def register(user_data: UserCreate, db: Session = Depends(get_db)):
    """Register a new user"""
    try:
        user = AuthService.register_user(db, user_data)
        return user
    except HTTPException:
        # Re-raise HTTP exceptions (like validation errors) as-is
        raise
    except ValueError as e:
        # Catch validation errors from password hashing
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        # Catch any unexpected errors and return a proper HTTP exception
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Registration failed: {str(e)}"
        )


@router.post("/login", response_model=Token)
def login(user_credentials: UserLogin, db: Session = Depends(get_db)):
    """Login and get access token"""
    user = AuthService.authenticate_user(
        db,
        user_credentials.username,
        user_credentials.password
    )
    access_token = AuthService.create_access_token_for_user(user)
    return {
        "access_token": access_token,
        "token_type": "bearer"
    }


@router.post("/google", response_model=Token)
def google_login(token_data: GoogleToken, db: Session = Depends(get_db)):
    """Authenticate via Google OAuth and return access token"""
    try:
        # Verify the Google credential token via Google's tokeninfo endpoint
        token_url = f"https://oauth2.googleapis.com/tokeninfo?id_token={token_data.credential}"
        req = urllib.request.Request(token_url)
        
        try:
            with urllib.request.urlopen(req, timeout=10) as response:
                idinfo = json.loads(response.read().decode())
        except urllib.error.HTTPError:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid Google token"
            )

        # Verify the token was issued for our app
        if idinfo.get("aud") != settings.GOOGLE_CLIENT_ID:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token was not issued for this application"
            )

        email = idinfo.get("email")
        full_name = idinfo.get("name", "")

        if not email:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Google account does not have an email"
            )

        # Check if user already exists by email
        user = db.query(User).filter(User.email == email).first()

        if not user:
            # Auto-create user from Google info
            base_username = email.split("@")[0]
            username = base_username
            counter = 1
            while db.query(User).filter(User.username == username).first():
                username = f"{base_username}{counter}"
                counter += 1

            random_password = secrets.token_urlsafe(32)

            user = User(
                email=email,
                username=username,
                full_name=full_name,
                phone_number=None,
                hashed_password=get_password_hash(random_password),
                is_active=True,
                is_admin=False,
            )
            db.add(user)
            db.commit()
            db.refresh(user)

        if not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="User account is inactive"
            )

        access_token = AuthService.create_access_token_for_user(user)
        return {
            "access_token": access_token,
            "token_type": "bearer"
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Google authentication failed: {str(e)}"
        )


@router.get("/me", response_model=UserResponse)
def get_current_user_info(current_user: User = Depends(get_current_active_user)):
    """Get current user information"""
    return current_user
