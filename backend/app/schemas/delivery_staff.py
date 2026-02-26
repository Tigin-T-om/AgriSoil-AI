from pydantic import BaseModel, EmailStr, field_validator
from typing import Optional, List
from datetime import datetime


# ─── Delivery Staff Schemas ────────────────────────────────

class DeliveryStaffBase(BaseModel):
    email: EmailStr
    username: str
    full_name: str
    phone_number: Optional[str] = None
    district: str


class DeliveryStaffCreate(DeliveryStaffBase):
    password: str

    @field_validator('password')
    @classmethod
    def validate_password_length(cls, v: str) -> str:
        if not v:
            raise ValueError('Password is required')
        if len(v) < 6:
            raise ValueError('Password must be at least 6 characters long')
        password_bytes = v.encode('utf-8')
        if len(password_bytes) > 72:
            raise ValueError('Password is too long. Maximum length is 72 bytes.')
        return v


class DeliveryStaffUpdate(BaseModel):
    full_name: Optional[str] = None
    phone_number: Optional[str] = None
    district: Optional[str] = None
    is_available: Optional[bool] = None


class DeliveryStaffResponse(DeliveryStaffBase):
    id: int
    is_available: bool
    is_active: bool
    active_orders_count: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class DeliveryStaffBrief(BaseModel):
    """Brief version for embedding in order responses"""
    id: int
    full_name: str
    phone_number: Optional[str] = None
    district: str
    is_available: bool

    class Config:
        from_attributes = True


class DeliveryStaffLogin(BaseModel):
    username: str
    password: str


# ─── Delivery Assignment Schemas ────────────────────────────

class DeliveryAssignRequest(BaseModel):
    """Admin assigns delivery staff to an order"""
    delivery_staff_id: int


class DeliveryStatusUpdate(BaseModel):
    """Delivery staff updates order delivery status"""
    status: str  # shipped or delivered
    delivery_notes: Optional[str] = None

    @field_validator('status')
    @classmethod
    def validate_status(cls, v: str) -> str:
        allowed = ['shipped', 'delivered']
        if v.lower() not in allowed:
            raise ValueError(f'Delivery staff can only set status to: {", ".join(allowed)}')
        return v.lower()
