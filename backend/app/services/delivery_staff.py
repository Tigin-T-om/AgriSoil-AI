from sqlalchemy.orm import Session, joinedload
from sqlalchemy import asc
from typing import List, Optional
from fastapi import HTTPException, status
from app.models.delivery_staff import DeliveryStaff
from app.models.order import Order, OrderItem, OrderStatus
from app.core.security import get_password_hash, verify_password, create_access_token
from app.schemas.delivery_staff import DeliveryStaffCreate, DeliveryStaffUpdate
from datetime import timedelta
from app.core.config import settings


class DeliveryStaffService:

    # ─── Auth ─────────────────────────────────────────────

    @staticmethod
    def create_delivery_staff(db: Session, data: DeliveryStaffCreate) -> DeliveryStaff:
        """Admin creates a new delivery staff account"""
        # Check for existing email/username
        if db.query(DeliveryStaff).filter(DeliveryStaff.email == data.email).first():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered for a delivery staff"
            )
        if db.query(DeliveryStaff).filter(DeliveryStaff.username == data.username).first():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Username already taken"
            )

        staff = DeliveryStaff(
            email=data.email,
            username=data.username,
            full_name=data.full_name,
            phone_number=data.phone_number,
            district=data.district,
            hashed_password=get_password_hash(data.password),
            is_available=True,
            is_active=True,
            active_orders_count=0,
        )
        db.add(staff)
        db.commit()
        db.refresh(staff)
        return staff

    @staticmethod
    def authenticate(db: Session, username: str, password: str) -> DeliveryStaff:
        """Authenticate delivery staff by username + password"""
        staff = db.query(DeliveryStaff).filter(DeliveryStaff.username == username).first()
        if not staff or not verify_password(password, staff.hashed_password):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid username or password",
                headers={"WWW-Authenticate": "Bearer"},
            )
        if not staff.is_active:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Delivery staff account is inactive"
            )
        return staff

    @staticmethod
    def create_token_for_staff(staff: DeliveryStaff) -> str:
        """Create JWT with role=delivery_staff"""
        token_data = {
            "sub": staff.username,
            "role": "delivery_staff",
            "staff_id": staff.id,
        }
        return create_access_token(
            data=token_data,
            expires_delta=timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        )

    # ─── CRUD ─────────────────────────────────────────────

    @staticmethod
    def get_all(db: Session, skip: int = 0, limit: int = 100) -> List[DeliveryStaff]:
        """Get all delivery staff (admin)"""
        return db.query(DeliveryStaff).order_by(DeliveryStaff.id.desc()).offset(skip).limit(limit).all()

    @staticmethod
    def get_by_id(db: Session, staff_id: int) -> DeliveryStaff:
        staff = db.query(DeliveryStaff).filter(DeliveryStaff.id == staff_id).first()
        if not staff:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Delivery staff not found"
            )
        return staff

    @staticmethod
    def get_by_username(db: Session, username: str) -> Optional[DeliveryStaff]:
        return db.query(DeliveryStaff).filter(DeliveryStaff.username == username).first()

    @staticmethod
    def update_profile(db: Session, staff_id: int, data: DeliveryStaffUpdate) -> DeliveryStaff:
        """Delivery staff updates their own profile (district, availability, etc.)"""
        staff = DeliveryStaffService.get_by_id(db, staff_id)
        update_data = data.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(staff, field, value)
        db.commit()
        db.refresh(staff)
        return staff

    @staticmethod
    def toggle_active(db: Session, staff_id: int) -> DeliveryStaff:
        """Admin toggles delivery staff active state"""
        staff = DeliveryStaffService.get_by_id(db, staff_id)
        staff.is_active = not staff.is_active
        db.commit()
        db.refresh(staff)
        return staff

    # ─── Order Assignment ─────────────────────────────────

    @staticmethod
    def auto_assign(db: Session, order: Order) -> Optional[DeliveryStaff]:
        """
        Auto-assign a delivery staff to an order based on:
        1. Same district as customer's order district
        2. Available and active
        3. Lowest active_orders_count (least busy)
        Returns the assigned staff or None if nobody available.
        """
        if not order.district:
            return None

        staff = (
            db.query(DeliveryStaff)
            .filter(
                DeliveryStaff.district == order.district,
                DeliveryStaff.is_available == True,
                DeliveryStaff.is_active == True,
            )
            .order_by(asc(DeliveryStaff.active_orders_count))
            .first()
        )

        if staff:
            order.delivery_staff_id = staff.id
            staff.active_orders_count += 1
            db.commit()
            db.refresh(order)
            db.refresh(staff)
        return staff

    @staticmethod
    def assign_to_order(db: Session, order_id: int, staff_id: int) -> Order:
        """Admin manually assigns or reassigns delivery staff to an order"""
        order = (
            db.query(Order)
            .options(
                joinedload(Order.order_items).joinedload(OrderItem.product),
                joinedload(Order.user),
                joinedload(Order.delivery_staff),
            )
            .filter(Order.id == order_id)
            .first()
        )
        if not order:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found")

        new_staff = DeliveryStaffService.get_by_id(db, staff_id)

        # If previously assigned, decrement old staff's count
        if order.delivery_staff_id and order.delivery_staff_id != staff_id:
            old_staff = db.query(DeliveryStaff).filter(DeliveryStaff.id == order.delivery_staff_id).first()
            if old_staff and old_staff.active_orders_count > 0:
                old_staff.active_orders_count -= 1

        # Assign new staff
        if order.delivery_staff_id != staff_id:
            new_staff.active_orders_count += 1

        order.delivery_staff_id = staff_id
        db.commit()
        db.refresh(order)
        return order

    @staticmethod
    def unassign_from_order(db: Session, order_id: int) -> Order:
        """Admin unassigns delivery staff from an order"""
        order = (
            db.query(Order)
            .options(
                joinedload(Order.order_items).joinedload(OrderItem.product),
                joinedload(Order.user),
                joinedload(Order.delivery_staff),
            )
            .filter(Order.id == order_id)
            .first()
        )
        if not order:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found")

        if order.delivery_staff_id:
            old_staff = db.query(DeliveryStaff).filter(DeliveryStaff.id == order.delivery_staff_id).first()
            if old_staff and old_staff.active_orders_count > 0:
                old_staff.active_orders_count -= 1

        order.delivery_staff_id = None
        db.commit()
        db.refresh(order)
        return order

    # ─── Delivery Staff: my assigned orders ───────────────

    @staticmethod
    def get_assigned_orders(db: Session, staff_id: int, skip: int = 0, limit: int = 100) -> List[Order]:
        """Get all orders assigned to a delivery staff"""
        return (
            db.query(Order)
            .options(
                joinedload(Order.order_items).joinedload(OrderItem.product),
                joinedload(Order.user),
            )
            .filter(Order.delivery_staff_id == staff_id)
            .order_by(Order.created_at.desc())
            .offset(skip)
            .limit(limit)
            .all()
        )

    @staticmethod
    def update_delivery_status(db: Session, order_id: int, staff_id: int, new_status: str, delivery_notes: Optional[str] = None) -> Order:
        """
        Delivery staff updates order status (only shipped -> delivered allowed).
        """
        order = (
            db.query(Order)
            .options(
                joinedload(Order.order_items).joinedload(OrderItem.product),
                joinedload(Order.user),
                joinedload(Order.delivery_staff),
            )
            .filter(Order.id == order_id)
            .first()
        )
        if not order:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found")

        if order.delivery_staff_id != staff_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="This order is not assigned to you"
            )

        # Validate transition
        allowed_transitions = {
            "shipped": [OrderStatus.PROCESSING, OrderStatus.CONFIRMED],
            "delivered": [OrderStatus.SHIPPED],
        }
        current = order.status
        target_status = OrderStatus(new_status)

        if current not in allowed_transitions.get(new_status, []):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Cannot change status from '{current.value}' to '{new_status}'"
            )

        order.status = target_status
        if delivery_notes:
            order.delivery_notes = delivery_notes

        # If delivered, decrement active count
        if target_status == OrderStatus.DELIVERED:
            staff = db.query(DeliveryStaff).filter(DeliveryStaff.id == staff_id).first()
            if staff and staff.active_orders_count > 0:
                staff.active_orders_count -= 1

        db.commit()
        db.refresh(order)
        return order

    @staticmethod
    def get_available_staff_for_district(db: Session, district: str) -> List[DeliveryStaff]:
        """Get available delivery staff for a specific district (used by admin for manual assignment)"""
        return (
            db.query(DeliveryStaff)
            .filter(
                DeliveryStaff.district == district,
                DeliveryStaff.is_available == True,
                DeliveryStaff.is_active == True,
            )
            .order_by(asc(DeliveryStaff.active_orders_count))
            .all()
        )
