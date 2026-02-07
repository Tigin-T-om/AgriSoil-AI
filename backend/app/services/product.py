from sqlalchemy.orm import Session
from typing import List, Optional
from fastapi import HTTPException, status
from app.models.product import Product
from app.schemas.product import ProductCreate, ProductUpdate


class ProductService:
    @staticmethod
    def create_product(db: Session, product_data: ProductCreate) -> Product:
        """Create a new product"""
        db_product = Product(**product_data.model_dump())
        db.add(db_product)
        db.commit()
        db.refresh(db_product)
        return db_product

    @staticmethod
    def get_product(db: Session, product_id: int) -> Optional[Product]:
        """Get a product by ID"""
        return db.query(Product).filter(Product.id == product_id).first()

    @staticmethod
    def get_products(
        db: Session,
        skip: int = 0,
        limit: int = 100,
        category: Optional[str] = None,
        search: Optional[str] = None
    ) -> List[Product]:
        """Get list of products with optional filtering"""
        query = db.query(Product)
        
        if category:
            query = query.filter(Product.category == category)
        
        if search:
            query = query.filter(
                Product.name.ilike(f"%{search}%")
                | Product.description.ilike(f"%{search}%")
            )
        
        return query.filter(Product.is_available == True).offset(skip).limit(limit).all()

    @staticmethod
    def update_product(
        db: Session,
        product_id: int,
        product_data: ProductUpdate
    ) -> Product:
        """Update a product"""
        db_product = db.query(Product).filter(Product.id == product_id).first()
        if not db_product:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Product not found"
            )
        
        update_data = product_data.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_product, field, value)
        
        db.commit()
        db.refresh(db_product)
        return db_product

    @staticmethod
    def delete_product(db: Session, product_id: int) -> bool:
        """Delete a product (soft delete by setting is_available=False)"""
        db_product = db.query(Product).filter(Product.id == product_id).first()
        if not db_product:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Product not found"
            )
        
        db_product.is_available = False
        db.commit()
        return True

    @staticmethod
    def search_by_crop(db: Session, crop_name: str, limit: int = 5) -> List[Product]:
        """
        Search products related to a crop name.
        Used by soil analysis to show relevant products.
        
        Searches in product name and description for the crop keyword.
        """
        if not crop_name:
            return []
        
        # Clean crop name (lowercase, strip)
        crop_keyword = crop_name.lower().strip()
        
        # Search for products matching the crop name
        products = db.query(Product).filter(
            Product.is_available == True,
            Product.stock_quantity > 0,
            (
                Product.name.ilike(f"%{crop_keyword}%") |
                Product.description.ilike(f"%{crop_keyword}%")
            )
        ).limit(limit).all()
        
        return products
    
    @staticmethod
    def get_related_products(db: Session, crop_names: List[str], limit: int = 6) -> List[Product]:
        """
        Get products related to multiple crop names.
        Used to display product recommendations after soil analysis.
        """
        if not crop_names:
            return []
        
        all_products = []
        seen_ids = set()
        
        for crop in crop_names:
            crop_keyword = crop.lower().strip()
            products = db.query(Product).filter(
                Product.is_available == True,
                Product.stock_quantity > 0,
                (
                    Product.name.ilike(f"%{crop_keyword}%") |
                    Product.description.ilike(f"%{crop_keyword}%")
                )
            ).limit(3).all()
            
            for product in products:
                if product.id not in seen_ids:
                    all_products.append(product)
                    seen_ids.add(product.id)
                    
                    if len(all_products) >= limit:
                        return all_products
        
        return all_products
