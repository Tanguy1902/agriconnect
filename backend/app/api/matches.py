from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from sqlalchemy.orm import Session
from typing import List
from app.api import deps
from app.models import match as match_model
from app.models.user import UserType
from app.database import get_db
from app.services.notification import notify_user
from app.tasks import send_notification_task
from pydantic import BaseModel
from datetime import datetime

router = APIRouter()
class MatchResponse(BaseModel):
    id: int
    match_score: float
    matching_reason: str | None
    status: str
    created_at: datetime
    offer: dict | None = None
    demand: dict | None = None

    class Config:
        from_attributes = True

class MatchStatusUpdate(BaseModel):
    status: str

def get_user_matches(db: Session, current_user: deps.User):
    """Helper function to get matches for current user"""
    query = db.query(match_model.Match)
    
    if current_user.user_type == UserType.AGRICULTEUR:
        # Farmer sees matches for their offers
        query = query.join(match_model.Match.offer).filter(match_model.Match.offer.has(farmer_id=current_user.id))
    elif current_user.user_type == UserType.COLLECTEUR:
        # Collector sees matches for their demands
        query = query.join(match_model.Match.demand).filter(match_model.Match.demand.has(collector_id=current_user.id))
    
    # Include related data for display
    matches = query.order_by(match_model.Match.created_at.desc()).all()
    
    # Manually construct response to include necessary details
    response = []
    for m in matches:
        item = MatchResponse(
            id=m.id,
            match_score=m.match_score,
            matching_reason=m.matching_reason,
            status=m.status.value,
            created_at=m.created_at
        )
        # Populate details based on who is asking
        if current_user.user_type == UserType.AGRICULTEUR:
            # Farmer wants to see the Demand details
            item.demand = {
                "id": m.demand.id,
                "product_name": m.demand.product_name or (m.demand.product.name if m.demand.product else "Unknown"),
                "quantity": m.demand.quantity,
                "max_unit_price": m.demand.max_unit_price,
                "collector": {
                    "id": m.demand.collector.id,
                    "full_name": m.demand.collector.full_name,
                    "region": m.demand.collector.location_region
                }
            }
            item.offer = {
                "id": m.offer.id,
                "product": {
                    "name": m.offer.product.name,
                    "unit": m.offer.product.unit
                },
                "quantity": m.offer.quantity,
                "unit_price": m.offer.unit_price,
                "location_region": m.offer.location_region
            }
        else:
            # Collector wants to see the Offer details
            item.offer = {
                "id": m.offer.id,
                "product": {
                    "name": m.offer.product.name,
                    "unit": m.offer.product.unit
                },
                "quantity": m.offer.quantity,
                "unit_price": m.offer.unit_price,
                "location_region": m.offer.location_region,
                "farmer": {
                    "id": m.offer.farmer.id,
                    "full_name": m.offer.farmer.full_name,
                    "region": m.offer.farmer.location_region
                }
            }
            item.demand = {
                "id": m.demand.id,
                "product_name": m.demand.product_name or (m.demand.product.name if m.demand.product else "Unknown"),
                "quantity": m.demand.quantity,
                "max_unit_price": m.demand.max_unit_price
            }
        response.append(item)
        
    return response

@router.get("/", response_model=List[MatchResponse])
def read_all_matches(
    db: Session = Depends(get_db),
    current_user: deps.User = Depends(deps.get_current_active_user)
):
    """Get all matches for current user"""
    return get_user_matches(db, current_user)

@router.get("/me", response_model=List[MatchResponse])
def read_my_matches(
    db: Session = Depends(get_db),
    current_user: deps.User = Depends(deps.get_current_active_user)
):
    """Get my matches (alias for /)"""
    return get_user_matches(db, current_user)

@router.put("/{match_id}/status")
def update_match_status(
    match_id: int,
    status_update: MatchStatusUpdate,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: deps.User = Depends(deps.get_current_active_user)
):
    """Update match status (accepted/rejected)"""
    match = db.query(match_model.Match).filter(match_model.Match.id == match_id).first()
    if not match:
        raise HTTPException(status_code=404, detail="Match not found")
        
    # Verify ownership
    is_owner = False
    other_user = None
    if current_user.user_type == UserType.AGRICULTEUR and match.offer.farmer_id == current_user.id:
        is_owner = True
        other_user = match.demand.collector
    elif current_user.user_type == UserType.COLLECTEUR and match.demand.collector_id == current_user.id:
        is_owner = True
        other_user = match.offer.farmer
        
    if not is_owner:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    # If status is already what we want, return early
    if (status_update.status == "accepted" and match.status == match_model.MatchStatus.ACCEPTED) or \
       (status_update.status == "rejected" and match.status == match_model.MatchStatus.REJECTED):
        return {"status": status_update.status}

    # Update status
    if status_update.status == "accepted":
        match.status = match_model.MatchStatus.ACCEPTED
        msg = f"{current_user.full_name} a accepté votre match pour {match.offer.product.name}!"
        background_tasks.add_task(send_notification_task, other_user.id, msg, "success")
    elif status_update.status == "rejected":
        match.status = match_model.MatchStatus.REJECTED
        msg = f"{current_user.full_name} a décliné le match pour {match.offer.product.name}."
        background_tasks.add_task(send_notification_task, other_user.id, msg, "info")
    else:
        raise HTTPException(status_code=400, detail="Invalid status")
        
    db.commit()
    return {"status": status_update.status}

@router.post("/{match_id}/accept")
def accept_match(
    match_id: int,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: deps.User = Depends(deps.get_current_active_user)
):
    match = db.query(match_model.Match).filter(match_model.Match.id == match_id).first()
    if not match:
        raise HTTPException(status_code=404, detail="Match not found")
        
    # Verify ownership
    is_owner = False
    other_user = None
    if current_user.user_type == UserType.AGRICULTEUR and match.offer.farmer_id == current_user.id:
        is_owner = True
        other_user = match.demand.collector
    elif current_user.user_type == UserType.COLLECTEUR and match.demand.collector_id == current_user.id:
        is_owner = True
        other_user = match.offer.farmer
        
    if not is_owner:
        raise HTTPException(status_code=403, detail="Not authorized")
        
    if match.status == match_model.MatchStatus.ACCEPTED:
        return {"status": "accepted"}
        
    match.status = match_model.MatchStatus.ACCEPTED
    msg = f"{current_user.full_name} a accepté votre match pour {match.offer.product.name}!"
    background_tasks.add_task(send_notification_task, other_user.id, msg, "success")
    db.commit()
    return {"status": "accepted"}

@router.post("/{match_id}/reject")
def reject_match(
    match_id: int,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: deps.User = Depends(deps.get_current_active_user)
):
    match = db.query(match_model.Match).filter(match_model.Match.id == match_id).first()
    if not match:
        raise HTTPException(status_code=404, detail="Match not found")
        
    # Verify ownership
    is_owner = False
    other_user = None
    if current_user.user_type == UserType.AGRICULTEUR and match.offer.farmer_id == current_user.id:
        is_owner = True
        other_user = match.demand.collector
    elif current_user.user_type == UserType.COLLECTEUR and match.demand.collector_id == current_user.id:
        is_owner = True
        other_user = match.offer.farmer
        
    if not is_owner:
        raise HTTPException(status_code=403, detail="Not authorized")
        
    if match.status == match_model.MatchStatus.REJECTED:
        return {"status": "rejected"}
        
    match.status = match_model.MatchStatus.REJECTED
    msg = f"{current_user.full_name} a décliné le match pour {match.offer.product.name}."
    background_tasks.add_task(send_notification_task, other_user.id, msg, "info")
    db.commit()
    return {"status": "rejected"}
