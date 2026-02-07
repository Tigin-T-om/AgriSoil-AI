from sqlalchemy.orm import Session, relationship
from typing import List
from fastapi import HTTPException, status
from app.models.order import Order, OrderItem, OrderStatus
from app.models.product import Product
from app.schemas.order import OrderCreate
from app.services.product import ProductService


class OrderService:
    @staticmethod
    def create_order(db: Session, order_data: OrderCreate, user_id: int) -> Order:
        """Create a new order"""
        total_amount = 0.0
        order_items = []
        
        # Validate products and calculate total
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
                    detail=f"Product {product.name} is not available"
                )
            
            if product.stock_quantity < item_data.quantity:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Insufficient stock for product {product.name}"
                )
            
            item_total = product.price * item_data.quantity
            total_amount += item_total
            
            order_items.append({
                "product_id": product.id,
                "quantity": item_data.quantity,
                "price": product.price
            })
            
            # Update stock
            product.stock_quantity -= item_data.quantity
        
        # Create order
        db_order = Order(
            user_id=user_id,
            total_amount=total_amount,
            shipping_address=order_data.shipping_address,
            phone_number=order_data.phone_number,
            notes=order_data.notes,
            status=OrderStatus.PENDING
        )
        
        db.add(db_order)
        db.flush()  # Flush to get order.id
        
        # Create order items
        for item in order_items:
            db_order_item = OrderItem(
                order_id=db_order.id,
                product_id=item["product_id"],
                quantity=item["quantity"],
                price=item["price"]
            )
            db.add(db_order_item)
        
        db.commit()
        db.refresh(db_order)
        return db_order

    @staticmethod
    def get_order(db: Session, order_id: int, user_id: int) -> Order:
        """Get an order by ID (user can only see their own orders)"""
        db_order = db.query(Order).filter(Order.id == order_id).first()
        if not db_order:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Order not found"
            )
        
        if db_order.user_id != user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to view this order"
            )
        
        return db_order

    @staticmethod
    def get_user_orders(db: Session, user_id: int, skip: int = 0, limit: int = 100) -> List[Order]:
        """Get all orders for a user"""
        return (
            db.query(Order)
            .filter(Order.user_id == user_id)
            .order_by(Order.created_at.desc())
            .offset(skip)
            .limit(limit)
            .all()
        )

    @staticmethod
    def get_all_orders(db: Session, skip: int = 0, limit: int = 100) -> List[Order]:
        """Get all orders (Admin)"""
        return (
            db.query(Order)
            .order_by(Order.created_at.desc())
            .options(relationship("User")) # Eager load user
            .offset(skip)
            .limit(limit)
            .all()
        )

    @staticmethod
    def update_order_status(
        db: Session,
        order_id: int,
        new_status: OrderStatus
    ) -> Order:
        """Update order status (admin only)"""
        db_order = db.query(Order).filter(Order.id == order_id).first()
        if not db_order:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Order not found"
            )
        
        db_order.status = new_status
        db.commit()
        db.refresh(db_order)
        return db_order
