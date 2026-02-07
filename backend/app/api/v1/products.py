from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from typing import List, Optional
from app.core.database import get_db
from app.schemas.product import ProductCreate, ProductUpdate, ProductResponse
from app.services.product import ProductService
from app.dependencies.auth import get_current_active_user, get_current_user
from app.models.user import User

router = APIRouter()


@router.post("/", response_model=ProductResponse, status_code=status.HTTP_201_CREATED)
def create_product(
    product_data: ProductCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new product (admin only)"""
    if not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    return ProductService.create_product(db, product_data)


@router.get("/", response_model=List[ProductResponse])
def get_products(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    category: Optional[str] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """Get list of products"""
    return ProductService.get_products(db, skip, limit, category, search)


@router.get("/{product_id}", response_model=ProductResponse)
def get_product(product_id: int, db: Session = Depends(get_db)):
    """Get a product by ID"""
    product = ProductService.get_product(db, product_id)
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )
    return product


@router.put("/{product_id}", response_model=ProductResponse)
def update_product(
    product_id: int,
    product_data: ProductUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update a product (admin only)"""
    if not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    return ProductService.update_product(db, product_id, product_data)


@router.delete("/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_product(
    product_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete a product (admin only)"""
    if not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    ProductService.delete_product(db, product_id)
    return None


@router.get("/search/by-crop/{crop_name}", response_model=List[ProductResponse])
def search_products_by_crop(
    crop_name: str,
    limit: int = Query(5, ge=1, le=20),
    db: Session = Depends(get_db)
):
    """
    Search products related to a crop name.
    Used by soil analysis page to show relevant products.
    """
    return ProductService.search_by_crop(db, crop_name, limit)


@router.post("/search/by-crops", response_model=List[ProductResponse])
def search_products_by_multiple_crops(
    crop_names: List[str],
    limit: int = Query(6, ge=1, le=20),
    db: Session = Depends(get_db)
):
    """
    Search products related to multiple crop names.
    Used after soil analysis to show products for recommended and alternative crops.
    """
    return ProductService.get_related_products(db, crop_names, limit)
