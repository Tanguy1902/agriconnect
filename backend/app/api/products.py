from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.api import deps
from app.schemas import product as product_schema
from app.models import product as product_model
from app.models.user import UserType
from app.database import get_db

router = APIRouter()

from sqlalchemy import func
from app.models import offer as offer_model

@router.get("/", response_model=List[product_schema.ProductResponse])
def read_products(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    products = db.query(product_model.Product).offset(skip).limit(limit).all()
    
    # Enrich with offer count
    for p in products:
        count = db.query(func.count(offer_model.Offer.id))\
            .filter(offer_model.Offer.product_id == p.id)\
            .scalar()
        setattr(p, 'offer_count', count)
        
    return products

@router.get("/{product_id}", response_model=product_schema.ProductResponse)
def read_product(product_id: int, db: Session = Depends(get_db)):
    product = db.query(product_model.Product).filter(product_model.Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    # Enrich with offer count
    count = db.query(func.count(offer_model.Offer.id))\
        .filter(offer_model.Offer.product_id == product.id)\
        .scalar()
    setattr(product, 'offer_count', count)
    
    return product

@router.post("/", response_model=product_schema.ProductResponse)
def create_product(
    product: product_schema.ProductCreate,
    db: Session = Depends(get_db),
    current_user: deps.User = Depends(deps.get_current_active_user)
):
    # Allow any authenticated user to create a product (for now)
    # if current_user.user_type != UserType.ADMIN:
    #     raise HTTPException(status_code=403, detail="Not authorized")
    
    db_product = product_model.Product(**product.model_dump())
    db.add(db_product)
    db.commit()
    db.refresh(db_product)
    return db_product

