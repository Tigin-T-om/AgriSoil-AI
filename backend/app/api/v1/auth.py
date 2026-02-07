from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.schemas.user import UserCreate, UserLogin, UserResponse, Token
from app.services.auth import AuthService
from app.dependencies.auth import get_current_active_user
from app.models.user import User

router = APIRouter()


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


@router.get("/me", response_model=UserResponse)
def get_current_user_info(current_user: User = Depends(get_current_active_user)):
    """Get current user information"""
    return current_user
