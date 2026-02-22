from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
from app.models.order import OrderStatus, PaymentStatus


# Brief schemas for nested responses
class ProductBrief(BaseModel):
    id: int
    name: str
    image_url: Optional[str] = None
    category: Optional[str] = None

    class Config:
        from_attributes = True


class UserBrief(BaseModel):
    id: int
    username: str
    email: str
    full_name: Optional[str] = None

    class Config:
        from_attributes = True


class OrderItemBase(BaseModel):
    product_id: int
    quantity: int


class OrderItemCreate(OrderItemBase):
    pass


class OrderItemResponse(OrderItemBase):
    id: int
    order_id: int
    price: float
    created_at: datetime
    product: Optional[ProductBrief] = None

    class Config:
        from_attributes = True


class OrderBase(BaseModel):
    shipping_address: str
    phone_number: Optional[str] = None
    notes: Optional[str] = None


class OrderCreate(OrderBase):
    items: List[OrderItemCreate]


class OrderResponse(OrderBase):
    id: int
    user_id: int
    total_amount: float
    status: OrderStatus
    payment_status: Optional[PaymentStatus] = PaymentStatus.PENDING
    razorpay_order_id: Optional[str] = None
    razorpay_payment_id: Optional[str] = None
    created_at: datetime
    updated_at: Optional[datetime] = None
    order_items: List[OrderItemResponse] = []
    user: Optional[UserBrief] = None

    class Config:
        from_attributes = True


# Razorpay payment schemas
class RazorpayOrderCreate(BaseModel):
    """Request body for creating a Razorpay order"""
    items: List[OrderItemCreate]
    shipping_address: str
    phone_number: Optional[str] = None
    notes: Optional[str] = None


class RazorpayOrderResponse(BaseModel):
    """Response after creating a Razorpay order"""
    razorpay_order_id: str
    amount: int  # Amount in paise
    currency: str
    db_order_id: int
    key_id: str  # Razorpay public key for frontend


class RazorpayPaymentVerify(BaseModel):
    """Request body for verifying payment after Razorpay checkout"""
    razorpay_order_id: str
    razorpay_payment_id: str
    razorpay_signature: str
    db_order_id: int
