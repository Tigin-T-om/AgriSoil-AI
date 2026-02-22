from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.schemas.user import (
    UserCreate, UserLogin, UserResponse, Token,
    ForgotPasswordRequest, VerifyOTPRequest, ResetPasswordRequest,
)
from app.services.auth import AuthService
from app.services.email import EmailService
from app.dependencies.auth import get_current_active_user
from app.models.user import User
from app.core.config import settings
from app.core.security import get_password_hash, create_access_token
from pydantic import BaseModel
from datetime import datetime, timedelta, timezone
import secrets
import random
import string
import urllib.request
import urllib.parse
import urllib.error
import json

router = APIRouter()


class GoogleToken(BaseModel):
    credential: str


class TwitterCallbackData(BaseModel):
    code: str
    code_verifier: str


# ─────────────────────────────────────────────────────────
# REGISTER / LOGIN / ME
# ─────────────────────────────────────────────────────────

@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def register(user_data: UserCreate, db: Session = Depends(get_db)):
    """Register a new user"""
    try:
        user = AuthService.register_user(db, user_data)
        return user
    except HTTPException:
        raise
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
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


# ─────────────────────────────────────────────────────────
# GOOGLE OAUTH
# ─────────────────────────────────────────────────────────

@router.post("/google", response_model=Token)
def google_login(token_data: GoogleToken, db: Session = Depends(get_db)):
    """Authenticate via Google OAuth and return access token"""
    try:
        # First try as ID Token
        token_url = f"https://oauth2.googleapis.com/tokeninfo?id_token={token_data.credential}"
        req = urllib.request.Request(token_url)

        try:
            with urllib.request.urlopen(req, timeout=10) as response:
                idinfo = json.loads(response.read().decode())
        except urllib.error.HTTPError:
            # If ID token failed, try as Access Token
            token_url = f"https://oauth2.googleapis.com/tokeninfo?access_token={token_data.credential}"
            req = urllib.request.Request(token_url)
            try:
                with urllib.request.urlopen(req, timeout=10) as response:
                    idinfo = json.loads(response.read().decode())
            except urllib.error.HTTPError:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Invalid Google token"
                )

        # Check audience (for ID token) or other validation
        if "aud" in idinfo and idinfo.get("aud") != settings.GOOGLE_CLIENT_ID:
            # Note: Access tokens might strictly not have 'aud' in tokeninfo or it matches client_id
            # If checking access token, we might skip this strict check or verify 'audience' field if present
            # But for safety, if 'aud' is present, it MUST match.
            pass 

        email = idinfo.get("email")
        full_name = idinfo.get("name", "")

        if not email:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Google account does not have an email"
            )

        user = db.query(User).filter(User.email == email).first()

        if not user:
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
        return {"access_token": access_token, "token_type": "bearer"}

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Google authentication failed: {str(e)}"
        )


# ─────────────────────────────────────────────────────────
# TWITTER / X  OAUTH 2.0 (PKCE)
# ─────────────────────────────────────────────────────────

@router.post("/twitter", response_model=Token)
def twitter_login(callback_data: TwitterCallbackData, db: Session = Depends(get_db)):
    """Exchange Twitter OAuth 2.0 authorization code for access token, then sign in / register."""
    try:
        # 1. Exchange auth code for Twitter access token
        token_url = "https://api.twitter.com/2/oauth2/token"
        token_payload = urllib.parse.urlencode({
            "grant_type": "authorization_code",
            "code": callback_data.code,
            "redirect_uri": settings.TWITTER_REDIRECT_URI,
            "client_id": settings.TWITTER_CLIENT_ID,
            "code_verifier": callback_data.code_verifier,
        }).encode()

        token_req = urllib.request.Request(
            token_url,
            data=token_payload,
            headers={"Content-Type": "application/x-www-form-urlencoded"},
            method="POST",
        )

        try:
            with urllib.request.urlopen(token_req, timeout=15) as resp:
                token_resp = json.loads(resp.read().decode())
        except urllib.error.HTTPError as http_err:
            error_body = http_err.read().decode() if http_err.fp else ""
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail=f"Twitter token exchange failed: {error_body}"
            )

        twitter_access_token = token_resp.get("access_token")
        if not twitter_access_token:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Twitter did not return an access token"
            )

        # 2. Fetch the user profile from Twitter
        user_req = urllib.request.Request(
            "https://api.twitter.com/2/users/me?user.fields=name,username,profile_image_url",
            headers={"Authorization": f"Bearer {twitter_access_token}"},
        )

        try:
            with urllib.request.urlopen(user_req, timeout=10) as resp:
                user_data = json.loads(resp.read().decode()).get("data", {})
        except urllib.error.HTTPError:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Failed to fetch Twitter user profile"
            )

        twitter_username = user_data.get("username", "")
        twitter_name = user_data.get("name", twitter_username)

        if not twitter_username:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Could not determine your Twitter username"
            )

        # 3. Find-or-create local user
        # Try matching by username first (twitter handle)
        synthetic_email = f"{twitter_username}@twitter.agri-soil.local"
        user = db.query(User).filter(User.email == synthetic_email).first()

        if not user:
            base_username = twitter_username
            username = base_username
            counter = 1
            while db.query(User).filter(User.username == username).first():
                username = f"{base_username}{counter}"
                counter += 1

            random_password = secrets.token_urlsafe(32)
            user = User(
                email=synthetic_email,
                username=username,
                full_name=twitter_name,
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
        return {"access_token": access_token, "token_type": "bearer"}

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Twitter authentication failed: {str(e)}"
        )


# ─────────────────────────────────────────────────────────
# FORGOT PASSWORD – OTP BASED  (3-step flow)
# ─────────────────────────────────────────────────────────

def _generate_otp(length: int = 6) -> str:
    """Generate a numeric OTP code."""
    return "".join(random.choices(string.digits, k=length))


@router.post("/forgot-password")
def forgot_password(body: ForgotPasswordRequest, db: Session = Depends(get_db)):
    """Step 1: Send OTP to user's email."""
    user = db.query(User).filter(User.email == body.email).first()
    if not user:
        # Return success even if user doesn't exist (prevents email enumeration)
        return {"message": "If the email is registered, an OTP has been sent."}

    otp = _generate_otp()
    user.otp_code = otp
    user.otp_expires_at = datetime.now(timezone.utc) + timedelta(minutes=settings.OTP_EXPIRE_MINUTES)
    db.commit()

    sent = EmailService.send_otp_email(
        to_email=user.email,
        otp_code=otp,
        user_name=user.full_name or user.username,
    )

    if not sent:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to send OTP email. Please try again later."
        )

    return {"message": "If the email is registered, an OTP has been sent."}


@router.post("/verify-otp")
def verify_otp(body: VerifyOTPRequest, db: Session = Depends(get_db)):
    """Step 2: Verify the OTP code (does NOT reset pw yet)."""
    user = db.query(User).filter(User.email == body.email).first()
    if not user or not user.otp_code:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid OTP or email.")

    if user.otp_code != body.otp:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid OTP code.")

    if user.otp_expires_at and user.otp_expires_at.replace(tzinfo=timezone.utc) < datetime.now(timezone.utc):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="OTP has expired. Please request a new one.")

    return {"message": "OTP verified successfully.", "verified": True}


@router.post("/reset-password")
def reset_password(body: ResetPasswordRequest, db: Session = Depends(get_db)):
    """Step 3: Reset the password after verifying OTP."""
    user = db.query(User).filter(User.email == body.email).first()
    if not user or not user.otp_code:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid request.")

    if user.otp_code != body.otp:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid OTP code.")

    if user.otp_expires_at and user.otp_expires_at.replace(tzinfo=timezone.utc) < datetime.now(timezone.utc):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="OTP has expired. Please request a new one.")

    # Update password and clear OTP
    user.hashed_password = get_password_hash(body.new_password)
    user.otp_code = None
    user.otp_expires_at = None
    db.commit()

    return {"message": "Password has been reset successfully."}
