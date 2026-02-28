from fastapi import APIRouter, Depends, HTTPException, status, File, UploadFile, Form, BackgroundTasks
from sqlalchemy.orm import Session
from typing import List, Optional
from app.api import deps
from app.schemas import offer as offer_schema
from app.models import offer as offer_model
from app.tasks import find_matches_for_offer_task
from app.models.user import UserType
from app.database import get_db
import shutil
import uuid
import os

router = APIRouter()

@router.post("/", response_model=offer_schema.OfferResponse)
def create_offer(
    product_id: int = Form(...),
    quantity: float = Form(...),
    unit_price: float = Form(...),
    description: Optional[str] = Form(None),
    location_region: Optional[str] = Form(None),
    location_commune: Optional[str] = Form(None),
    image: Optional[UploadFile] = File(None),
    background_tasks: BackgroundTasks = None,
    db: Session = Depends(get_db),
    current_user: deps.User = Depends(deps.get_current_active_user)
):
    if current_user.user_type.value != "agriculteur":
        raise HTTPException(status_code=403, detail="Only farmers can create offers")
    
    image_url = None
    if image:
        # Generate unique filename
        file_extension = os.path.splitext(image.filename)[1]
        filename = f"{uuid.uuid4()}{file_extension}"
        file_path = f"static/uploads/{filename}"
        
        # Save file
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(image.file, buffer)
            
        # Generate URL (relative path)
        # The frontend will need to prepend the API base URL
        image_url = f"/static/uploads/{filename}"

    offer_data = {
        "product_id": product_id,
        "quantity": quantity,
        "unit_price": unit_price,
        "description": description,
        "location_region": location_region,
        "location_commune": location_commune,
        "image_url": image_url,
        "farmer_id": current_user.id
    }
    
    db_offer = offer_model.Offer(**offer_data)
    db.add(db_offer)
    
    # Update Product image if not set
    if image_url:
        from app.models.product import Product
        product = db.query(Product).filter(Product.id == product_id).first()
        if product and not product.image_url:
            product.image_url = image_url
            db.add(product)
            
    db.commit()
    db.refresh(db_offer)
    
    # Trigger matching in background
    if background_tasks:
        background_tasks.add_task(find_matches_for_offer_task, db_offer.id)
    
    return db_offer

@router.get("/", response_model=List[offer_schema.OfferResponse])
def read_offers(
    skip: int = 0, 
    limit: int = 100, 
    product_id: Optional[int] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    region: Optional[str] = None,
    status: Optional[str] = "active",
    db: Session = Depends(get_db)
):
    query = db.query(offer_model.Offer)
    
    if status:
        query = query.filter(offer_model.Offer.status == status)
    if product_id:
        query = query.filter(offer_model.Offer.product_id == product_id)
    if min_price is not None:
        query = query.filter(offer_model.Offer.unit_price >= min_price)
    if max_price is not None:
        query = query.filter(offer_model.Offer.unit_price <= max_price)
    if region:
        query = query.filter(offer_model.Offer.location_region == region)
        
    offers = query.offset(skip).limit(limit).all()
    return offers


@router.get("/me", response_model=List[offer_schema.OfferResponse])
def read_my_offers(
    skip: int = 0, 
    limit: int = 100, 
    db: Session = Depends(get_db),
    current_user: deps.User = Depends(deps.get_current_active_user)
):
    offers = db.query(offer_model.Offer).filter(offer_model.Offer.farmer_id == current_user.id).offset(skip).limit(limit).all()
    return offers

@router.get("/{offer_id}", response_model=offer_schema.OfferResponse)
def read_offer(
    offer_id: int,
    db: Session = Depends(get_db)
):
    """Get a specific offer by ID"""
    offer = db.query(offer_model.Offer).filter(offer_model.Offer.id == offer_id).first()
    if not offer:
        raise HTTPException(status_code=404, detail="Offer not found")
    return offer

@router.put("/{offer_id}", response_model=offer_schema.OfferResponse)
def update_offer(
    offer_id: int,
    quantity: Optional[float] = Form(None),
    unit_price: Optional[float] = Form(None),
    quality: Optional[str] = Form(None),
    description: Optional[str] = Form(None),
    location_region: Optional[str] = Form(None),
    location_commune: Optional[str] = Form(None),
    image: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db),
    current_user: deps.User = Depends(deps.get_current_active_user)
):
    """Update an existing offer (only by owner)"""
    # Get the offer
    offer = db.query(offer_model.Offer).filter(offer_model.Offer.id == offer_id).first()
    if not offer:
        raise HTTPException(status_code=404, detail="Offer not found")
    
    # Verify ownership
    if offer.farmer_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to update this offer")
    
    # Update fields if provided
    if quantity is not None:
        offer.quantity = quantity
    if unit_price is not None:
        offer.unit_price = unit_price
    if quality is not None:
        offer.quality = quality
    if description is not None:
        offer.description = description
    if location_region is not None:
        offer.location_region = location_region
    if location_commune is not None:
        offer.location_commune = location_commune
    
    # Handle image upload
    if image:
        file_extension = os.path.splitext(image.filename)[1]
        filename = f"{uuid.uuid4()}{file_extension}"
        file_path = f"static/uploads/{filename}"
        
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(image.file, buffer)
        
        offer.image_url = f"/static/uploads/{filename}"
    
    db.commit()
    db.refresh(offer)
    
    return offer

@router.delete("/{offer_id}")
def delete_offer(
    offer_id: int,
    db: Session = Depends(get_db),
    current_user: deps.User = Depends(deps.get_current_active_user)
):
    """Delete an offer (only by owner)"""
    # Get the offer
    offer = db.query(offer_model.Offer).filter(offer_model.Offer.id == offer_id).first()
    if not offer:
        raise HTTPException(status_code=404, detail="Offer not found")
    
    # Verify ownership
    if offer.farmer_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to delete this offer")
    
    # Delete associated matches
    from app.models.match import Match
    db.query(Match).filter(Match.offer_id == offer_id).delete()
    
    # Delete the offer
    db.delete(offer)
    db.commit()
    
    return {"status": "success", "message": "Offer deleted successfully"}

