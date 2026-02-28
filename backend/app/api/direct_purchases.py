from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.api import deps
from app.schemas import direct_purchase as dp_schema
from app.models import direct_purchase as dp_model
from app.models import offer as offer_model
from app.models.user import UserType
from app.services.notification import notify_user
from app.database import get_db

router = APIRouter()

@router.post("/", response_model=dp_schema.DirectPurchaseResponse)
def create_direct_purchase(
    purchase: dp_schema.DirectPurchaseCreate,
    db: Session = Depends(get_db),
    current_user: deps.User = Depends(deps.get_current_active_user)
):
    if current_user.user_type != UserType.COLLECTEUR:
        raise HTTPException(status_code=403, detail="Only collectors can make direct purchases")
    
    # Verify offer exists
    offer = db.query(offer_model.Offer).filter(offer_model.Offer.id == purchase.offer_id).first()
    if not offer:
        raise HTTPException(status_code=404, detail="Offer not found")
        
    db_purchase = dp_model.DirectPurchase(
        **purchase.model_dump(),
        collector_id=current_user.id
    )
    db.add(db_purchase)
    
    # Create notification for the farmer using the service (triggers SMS)
    notify_user(
        db, 
        offer.farmer, 
        f"Un collecteur a effectué un achat direct pour votre offre de {offer.product.name} ({purchase.quantity} {offer.product.unit})",
        "info"
    )
    
    db.commit()
    db.refresh(db_purchase)
    
    return db_purchase

@router.get("/received", response_model=List[dp_schema.DirectPurchaseResponse])
def read_received_purchases(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: deps.User = Depends(deps.get_current_active_user)
):
    # For farmers: see purchases on their offers
    if current_user.user_type != UserType.AGRICULTEUR:
        raise HTTPException(status_code=403, detail="Only farmers can view received purchases")
        
    purchases = (
        db.query(dp_model.DirectPurchase)
        .join(offer_model.Offer)
        .filter(offer_model.Offer.farmer_id == current_user.id)
        .offset(skip)
        .limit(limit)
        .all()
    )
    return purchases

@router.get("/sent", response_model=List[dp_schema.DirectPurchaseResponse])
def read_sent_purchases(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: deps.User = Depends(deps.get_current_active_user)
):
    # For collectors: see purchases they made
    if current_user.user_type != UserType.COLLECTEUR:
        raise HTTPException(status_code=403, detail="Only collectors can view sent purchases")
        
    purchases = (
        db.query(dp_model.DirectPurchase)
        .filter(dp_model.DirectPurchase.collector_id == current_user.id)
        .offset(skip)
        .limit(limit)
        .all()
    )
    return purchases

@router.put("/{purchase_id}/status", response_model=dp_schema.DirectPurchaseResponse)
def update_purchase_status(
    purchase_id: int,
    status_update: dp_schema.DirectPurchaseUpdate,
    db: Session = Depends(get_db),
    current_user: deps.User = Depends(deps.get_current_active_user)
):
    purchase = db.query(dp_model.DirectPurchase).filter(dp_model.DirectPurchase.id == purchase_id).first()
    if not purchase:
        raise HTTPException(status_code=404, detail="Direct purchase not found")
        
    # Only the farmer (owner of the offer) can accept/reject
    # Or maybe the collector can cancel?
    # Let's implement farmer accept/reject first
    
    offer = db.query(offer_model.Offer).filter(offer_model.Offer.id == purchase.offer_id).first()
    
    if current_user.id != offer.farmer_id:
         raise HTTPException(status_code=403, detail="Not authorized to update this purchase")
         
    # If accepting, update stock
    if status_update.status == dp_model.DirectPurchaseStatus.ACCEPTED and purchase.status != dp_model.DirectPurchaseStatus.ACCEPTED:
        if offer.quantity < purchase.quantity:
            raise HTTPException(status_code=400, detail="Insufficient stock")
        
        offer.quantity -= purchase.quantity
        if offer.quantity <= 0:
            from app.models.offer import OfferStatus
            offer.status = OfferStatus.SOLD
            
    purchase.status = status_update.status
    db.commit()
    db.refresh(purchase)
    db.refresh(offer)
    return purchase
