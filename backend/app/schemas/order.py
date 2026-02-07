from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
from app.models.order import OrderStatus


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
    created_at: datetime
    updated_at: Optional[datetime] = None
    order_items: List[OrderItemResponse] = []

    class Config:
        from_attributes = True
