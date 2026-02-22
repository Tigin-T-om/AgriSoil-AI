"""
Payment API Endpoints
=====================
Handles Razorpay payment integration:
1. Create Razorpay order (before checkout)
2. Verify payment (after Razorpay checkout popup)
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.config import settings
from app.schemas.order import (
    RazorpayOrderCreate,
    RazorpayOrderResponse,
    RazorpayPaymentVerify,
    OrderResponse,
)
from app.services.payment import PaymentService
from app.services.order import OrderService
from app.services.product import ProductService
from app.dependencies.auth import get_current_active_user
from app.models.user import User
from app.models.order import Order, OrderItem, OrderStatus, PaymentStatus

router = APIRouter()


@router.post("/create-order", response_model=RazorpayOrderResponse)
def create_payment_order(
    order_data: RazorpayOrderCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Step 1: Create a Razorpay order and a pending DB order.
    
    Flow:
    1. Validate all products exist, are available, and have stock
    2. Calculate total from actual product prices (not from frontend)
    3. Create a Razorpay order with the total amount
    4. Create a DB order in PENDING status with PENDING payment
    5. Return Razorpay order details for frontend checkout popup
    """
    total_amount = 0.0
    order_items_data = []
    
    # Validate products and calculate total from actual DB prices
    for item_data in order_data.items:
        product = ProductService.get_product(db, item_data.product_id)
        if not product:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Product with id {item_data.product_id} not found"
            )
        
        if not product.is_available:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Product '{product.name}' is not available"
            )
        
        if product.stock_quantity < item_data.quantity:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Insufficient stock for '{product.name}'. Available: {product.stock_quantity}"
            )
        
        item_total = product.price * item_data.quantity
        total_amount += item_total
        order_items_data.append({
            "product_id": product.id,
            "quantity": item_data.quantity,
            "price": product.price
        })
    
    # Add shipping (free above ₹500)
    shipping = 0 if total_amount > 500 else 50
    total_with_shipping = total_amount + shipping
    
    # Create DB order first (PENDING status)
    db_order = Order(
        user_id=current_user.id,
        total_amount=total_with_shipping,
        shipping_address=order_data.shipping_address,
        phone_number=order_data.phone_number,
        notes=order_data.notes,
        status=OrderStatus.PENDING,
        payment_status=PaymentStatus.PENDING
    )
    db.add(db_order)
    db.flush()
    
    # Create order items
    for item in order_items_data:
        db_order_item = OrderItem(
            order_id=db_order.id,
            product_id=item["product_id"],
            quantity=item["quantity"],
            price=item["price"]
        )
        db.add(db_order_item)
    
    # Create Razorpay order
    try:
        razorpay_order = PaymentService.create_razorpay_order(
            amount_inr=total_with_shipping,
            receipt=f"order_{db_order.id}"
        )
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"Failed to create Razorpay order: {str(e)}"
        )
    
    # Store Razorpay order ID in DB
    db_order.razorpay_order_id = razorpay_order["id"]
    db.commit()
    db.refresh(db_order)
    
    return RazorpayOrderResponse(
        razorpay_order_id=razorpay_order["id"],
        amount=razorpay_order["amount"],
        currency=razorpay_order["currency"],
        db_order_id=db_order.id,
        key_id=settings.RAZORPAY_KEY_ID
    )


@router.post("/verify-payment", response_model=OrderResponse)
def verify_payment(
    payment_data: RazorpayPaymentVerify,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Step 2: Verify payment after Razorpay checkout popup.
    
    Flow:
    1. Find the pending DB order
    2. Verify Razorpay signature (HMAC SHA256)
    3. If valid: mark payment as PAID, update order status to CONFIRMED, deduct stock
    4. If invalid: mark payment as FAILED
    """
    # Find the order
    db_order = db.query(Order).filter(
        Order.id == payment_data.db_order_id,
        Order.user_id == current_user.id
    ).first()
    
    if not db_order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found"
        )
    
    if db_order.payment_status == PaymentStatus.PAID:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Payment already verified for this order"
        )
    
    # Verify signature
    is_valid = PaymentService.verify_payment_signature(
        razorpay_order_id=payment_data.razorpay_order_id,
        razorpay_payment_id=payment_data.razorpay_payment_id,
        razorpay_signature=payment_data.razorpay_signature
    )
    
    if is_valid:
        # Payment verified — update order
        db_order.payment_status = PaymentStatus.PAID
        db_order.status = OrderStatus.CONFIRMED
        db_order.razorpay_payment_id = payment_data.razorpay_payment_id
        db_order.razorpay_signature = payment_data.razorpay_signature
        
        # Deduct stock
        for order_item in db_order.order_items:
            product = ProductService.get_product(db, order_item.product_id)
            if product:
                product.stock_quantity = max(0, product.stock_quantity - order_item.quantity)
        
        db.commit()
        db.refresh(db_order)
        return db_order
    else:
        # Payment verification failed
        db_order.payment_status = PaymentStatus.FAILED
        db.commit()
        
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Payment verification failed. Signature mismatch."
        )
