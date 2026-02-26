from sqlalchemy import Column, Integer, String, Boolean, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base


class DeliveryStaff(Base):
    __tablename__ = "delivery_staff"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    username = Column(String, unique=True, index=True, nullable=False)
    full_name = Column(String, nullable=False)
    phone_number = Column(String, nullable=True)
    hashed_password = Column(String, nullable=False)
    district = Column(String, nullable=False, index=True)  # Service area
    is_available = Column(Boolean, default=True)  # Availability toggle
    is_active = Column(Boolean, default=True)  # Account active/inactive
    active_orders_count = Column(Integer, default=0)  # Current workload
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    assigned_orders = relationship("Order", back_populates="delivery_staff")
