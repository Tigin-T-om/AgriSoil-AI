from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session, joinedload
from typing import List, Optional
from app.core.database import get_db
from app.schemas.delivery_staff import (
    DeliveryStaffCreate,
    DeliveryStaffUpdate,
    DeliveryStaffResponse,
    DeliveryStaffLogin,
    DeliveryAssignRequest,
    DeliveryStatusUpdate,
)
from app.schemas.order import OrderResponse
from app.schemas.user import Token
from app.services.delivery_staff import DeliveryStaffService
from app.dependencies.auth import (
    get_current_active_superuser,
    get_current_delivery_staff,
)
from app.models.user import User
from app.models.delivery_staff import DeliveryStaff
from app.models.order import Order, OrderItem

router = APIRouter()


# ═══════════════════════════════════════════════════════════
# DELIVERY STAFF AUTH (public)
# ═══════════════════════════════════════════════════════════

@router.post("/login", response_model=Token)
def delivery_staff_login(
    credentials: DeliveryStaffLogin,
    db: Session = Depends(get_db),
):
    """Login as delivery staff and get JWT token"""
    staff = DeliveryStaffService.authenticate(db, credentials.username, credentials.password)
    token = DeliveryStaffService.create_token_for_staff(staff)
    return {"access_token": token, "token_type": "bearer"}


@router.get("/me", response_model=DeliveryStaffResponse)
def get_my_profile(
    current_staff: DeliveryStaff = Depends(get_current_delivery_staff),
):
    """Get current delivery staff profile"""
    return current_staff


@router.patch("/me", response_model=DeliveryStaffResponse)
def update_my_profile(
    data: DeliveryStaffUpdate,
    db: Session = Depends(get_db),
    current_staff: DeliveryStaff = Depends(get_current_delivery_staff),
):
    """Delivery staff updates own profile (district, availability, phone)"""
    return DeliveryStaffService.update_profile(db, current_staff.id, data)


# ═══════════════════════════════════════════════════════════
# DELIVERY STAFF DASHBOARD (delivery staff only)
# ═══════════════════════════════════════════════════════════

@router.get("/my-orders", response_model=List[OrderResponse])
def get_my_assigned_orders(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    db: Session = Depends(get_db),
    current_staff: DeliveryStaff = Depends(get_current_delivery_staff),
):
    """Get all orders assigned to the current delivery staff"""
    return DeliveryStaffService.get_assigned_orders(db, current_staff.id, skip, limit)


@router.patch("/orders/{order_id}/status", response_model=OrderResponse)
def update_order_delivery_status(
    order_id: int,
    data: DeliveryStatusUpdate,
    db: Session = Depends(get_db),
    current_staff: DeliveryStaff = Depends(get_current_delivery_staff),
):
    """Delivery staff updates order status (shipped/delivered)"""
    return DeliveryStaffService.update_delivery_status(
        db, order_id, current_staff.id, data.status, data.delivery_notes
    )


# ═══════════════════════════════════════════════════════════
# ADMIN: MANAGE DELIVERY STAFF
# ═══════════════════════════════════════════════════════════

@router.post("/", response_model=DeliveryStaffResponse, status_code=status.HTTP_201_CREATED)
def create_delivery_staff(
    data: DeliveryStaffCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_superuser),
):
    """Admin creates a new delivery staff account"""
    return DeliveryStaffService.create_delivery_staff(db, data)


@router.get("/", response_model=List[DeliveryStaffResponse])
def list_delivery_staff(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_superuser),
):
    """Admin lists all delivery staff"""
    return DeliveryStaffService.get_all(db, skip, limit)


# ── Routes with literal prefixes MUST come before /{staff_id} ──
# Otherwise FastAPI will try to parse "district", "assign", etc. as an integer

@router.get("/district/{district}", response_model=List[DeliveryStaffResponse])
def get_staff_by_district(
    district: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_superuser),
):
    """Admin: Get available delivery staff for a district"""
    return DeliveryStaffService.get_available_staff_for_district(db, district)


# ═══════════════════════════════════════════════════════════
# ADMIN: ORDER ↔ DELIVERY ASSIGNMENT
# (These use /assign/, /auto-assign/, /unassign/ prefixes
#  so they must be registered before /{staff_id})
# ═══════════════════════════════════════════════════════════

@router.post("/assign/{order_id}", response_model=OrderResponse)
def assign_delivery_staff_to_order(
    order_id: int,
    data: DeliveryAssignRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_superuser),
):
    """Admin assigns a delivery staff to an order (manual or override/reassign)"""
    return DeliveryStaffService.assign_to_order(db, order_id, data.delivery_staff_id)


@router.post("/auto-assign/{order_id}", response_model=OrderResponse)
def auto_assign_delivery_staff(
    order_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_superuser),
):
    """Admin triggers auto-assignment based on order district"""
    # Get the specific order directly
    target = (
        db.query(Order)
        .options(
            joinedload(Order.order_items).joinedload(OrderItem.product),
            joinedload(Order.user),
            joinedload(Order.delivery_staff),
        )
        .filter(Order.id == order_id)
        .first()
    )
    if not target:
        raise HTTPException(status_code=404, detail="Order not found")

    staff = DeliveryStaffService.auto_assign(db, target)
    if not staff:
        raise HTTPException(
            status_code=400,
            detail=f"No available delivery staff for district: {target.district or 'not specified'}"
        )
    # Reload the order with all relationships after assignment
    refreshed = (
        db.query(Order)
        .options(
            joinedload(Order.order_items).joinedload(OrderItem.product),
            joinedload(Order.user),
            joinedload(Order.delivery_staff),
        )
        .filter(Order.id == order_id)
        .first()
    )
    return refreshed


@router.delete("/unassign/{order_id}", response_model=OrderResponse)
def unassign_delivery_staff(
    order_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_superuser),
):
    """Admin unassigns delivery staff from an order"""
    return DeliveryStaffService.unassign_from_order(db, order_id)


# ── Parameterized route LAST ──
# This catches GET /delivery/{staff_id} — must be after all literal paths

@router.get("/{staff_id}", response_model=DeliveryStaffResponse)
def get_delivery_staff(
    staff_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_superuser),
):
    """Admin gets a specific delivery staff by ID"""
    return DeliveryStaffService.get_by_id(db, staff_id)


@router.patch("/{staff_id}/toggle-active", response_model=DeliveryStaffResponse)
def toggle_delivery_staff_active(
    staff_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_superuser),
):
    """Admin toggles delivery staff active/inactive"""
    return DeliveryStaffService.toggle_active(db, staff_id)
