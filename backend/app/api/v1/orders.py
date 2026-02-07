from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from typing import List, Optional
from app.core.database import get_db
from app.schemas.order import OrderCreate, OrderResponse
from app.services.order import OrderService
from app.dependencies.auth import get_current_active_user, get_current_user, get_current_active_superuser
from app.models.user import User
from app.models.order import OrderStatus

router = APIRouter()


@router.post("/", response_model=OrderResponse, status_code=status.HTTP_201_CREATED)
def create_order(
    order_data: OrderCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Create a new order"""
    return OrderService.create_order(db, order_data, current_user.id)


@router.get("/all", response_model=List[OrderResponse])
def get_all_orders(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_superuser)
):
    """Get ALL orders (Admin only)"""
    return OrderService.get_all_orders(db, skip, limit)


@router.get("/", response_model=List[OrderResponse])
def get_user_orders(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get all orders for current user"""
    return OrderService.get_user_orders(db, current_user.id, skip, limit)


@router.get("/{order_id}", response_model=OrderResponse)
def get_order(
    order_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get a specific order by ID"""
    return OrderService.get_order(db, order_id, current_user.id)


@router.patch("/{order_id}/status", response_model=OrderResponse)
def update_order_status(
    order_id: int,
    new_status: OrderStatus,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_superuser)
):
    """Update order status (admin only)"""
    return OrderService.update_order_status(db, order_id, new_status)
