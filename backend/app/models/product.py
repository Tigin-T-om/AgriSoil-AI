from sqlalchemy import Column, Integer, String, Float, Text, Boolean, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base


class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False, index=True)
    description = Column(Text, nullable=True)
    category = Column(String, nullable=False, index=True)  # e.g., "seeds", "crops"
    price = Column(Float, nullable=False)
    stock_quantity = Column(Integer, default=0)
    image_url = Column(String, nullable=True)
    is_available = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    order_items = relationship("OrderItem", back_populates="product")
