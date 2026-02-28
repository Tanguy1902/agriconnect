from fastapi import APIRouter, Depends, HTTPException, status, File, UploadFile
from sqlalchemy.orm import Session
from app.api import deps
from app.schemas import auth
from app.database import get_db
from app.utils import auth as auth_utils
from app.models.user import User, UserType
from typing import List, Optional
import os
import uuid
import shutil


router = APIRouter()

@router.get("/", response_model=List[auth.UserResponse])
async def list_users(
    user_type: Optional[UserType] = None,
    region: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_active_user)
):
    """List users with optional filtering"""
    query = db.query(User).filter(User.is_active == True)
    
    if user_type:
        query = query.filter(User.user_type == user_type)
    
    if region:
        query = query.filter(User.location_region.ilike(f"%{region}%"))
        
    return query.all()

@router.get("/me", response_model=auth.UserResponse)
async def read_users_me(current_user: auth.UserResponse = Depends(deps.get_current_active_user)):
    return current_user

@router.post("/me/avatar")
async def upload_avatar(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_active_user)
):
    """Upload a profile picture"""
    # Validate file type
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image")
    
    # Create directory if it doesn't exist
    upload_dir = "static/uploads/avatars"
    os.makedirs(upload_dir, exist_ok=True)
    
    # Generate unique filename
    file_extension = os.path.splitext(file.filename)[1]
    filename = f"{uuid.uuid4()}{file_extension}"
    file_path = os.path.join(upload_dir, filename)
    
    # Save file
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    # Update user profile picture path
    # We store the relative URL
    avatar_url = f"/static/uploads/avatars/{filename}"
    current_user.profile_picture = avatar_url
    db.commit()
    
    return {"url": avatar_url}

@router.put("/me", response_model=auth.UserResponse)
async def update_user_profile(
    user_update: auth.UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_active_user)
):
    """Update user profile information"""
    # Update fields if provided
    update_data = user_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(current_user, field, value)
    
    db.commit()
    db.refresh(current_user)
    
    return current_user

@router.put("/me/password")
async def change_password(
    password_change: auth.PasswordChange,
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_active_user)
):
    """Change user password"""
    # Verify old password
    if not auth_utils.verify_password(password_change.old_password, current_user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Incorrect password"
        )
    
    # Update password
    current_user.hashed_password = auth_utils.hash_password(password_change.new_password)

    db.commit()
    
    return {"status": "success", "message": "Password updated successfully"}

@router.delete("/me")
async def delete_account(
    password: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_active_user)
):
    """Delete user account (requires password confirmation)"""
    # Verify password
    if not auth_utils.verify_password(password, current_user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Incorrect password"
        )

    
    # Delete associated data
    # Offers
    from app.models.offer import Offer
    from app.models.demand import Demand
    from app.models.match import Match
    from app.models.direct_purchase import DirectPurchase
    from app.models.notification import Notification
    
    if current_user.user_type.value == "agriculteur":
        # Delete offers and related matches/purchases
        offers = db.query(Offer).filter(Offer.farmer_id == current_user.id).all()
        for offer in offers:
            db.query(Match).filter(Match.offer_id == offer.id).delete()
            db.query(DirectPurchase).filter(DirectPurchase.offer_id == offer.id).delete()
        db.query(Offer).filter(Offer.farmer_id == current_user.id).delete()
    else:
        # Delete demands and related matches/purchases
        demands = db.query(Demand).filter(Demand.collector_id == current_user.id).all()
        for demand in demands:
            db.query(Match).filter(Match.demand_id == demand.id).delete()
        db.query(Demand).filter(Demand.collector_id == current_user.id).delete()
        db.query(DirectPurchase).filter(DirectPurchase.collector_id == current_user.id).delete()
    
    # Delete notifications
    db.query(Notification).filter(Notification.user_id == current_user.id).delete()
    
    # Delete user
    db.delete(current_user)
    db.commit()
    
    return {"status": "success", "message": "Account deleted successfully"}

