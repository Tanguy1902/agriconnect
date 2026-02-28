from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.api import deps
from app.models import notification as notification_model
from app.database import get_db
from pydantic import BaseModel
from datetime import datetime

router = APIRouter()

class NotificationResponse(BaseModel):
    id: int
    message: str
    is_read: bool
    created_at: datetime

    class Config:
        from_attributes = True

@router.get("/", response_model=List[NotificationResponse])
def read_notifications(
    skip: int = 0,
    limit: int = 50,
    is_read: bool | None = None,
    db: Session = Depends(get_db),
    current_user: deps.User = Depends(deps.get_current_active_user)
):
    query = db.query(notification_model.Notification)\
        .filter(notification_model.Notification.user_id == current_user.id)
    
    if is_read is not None:
        query = query.filter(notification_model.Notification.is_read == is_read)
        
    notifications = query.order_by(notification_model.Notification.created_at.desc())\
        .offset(skip)\
        .limit(limit)\
        .all()
    return notifications

@router.get("/unread-count")
def get_unread_count(
    db: Session = Depends(get_db),
    current_user: deps.User = Depends(deps.get_current_active_user)
):
    """Get the number of unread notifications for the current user"""
    count = db.query(notification_model.Notification)\
        .filter(notification_model.Notification.user_id == current_user.id)\
        .filter(notification_model.Notification.is_read == False)\
        .count()
    return {"count": count}

@router.post("/mark-all-read")
def mark_all_as_read(
    db: Session = Depends(get_db),
    current_user: deps.User = Depends(deps.get_current_active_user)
):
    """Mark all notifications for the current user as read"""
    db.query(notification_model.Notification)\
        .filter(notification_model.Notification.user_id == current_user.id)\
        .filter(notification_model.Notification.is_read == False)\
        .update({notification_model.Notification.is_read: True})
    db.commit()
    return {"status": "success", "message": "All notifications marked as read"}

@router.post("/{notification_id}/read")
def mark_as_read_post(
    notification_id: int,
    db: Session = Depends(get_db),
    current_user: deps.User = Depends(deps.get_current_active_user)
):
    notification = db.query(notification_model.Notification)\
        .filter(notification_model.Notification.id == notification_id)\
        .filter(notification_model.Notification.user_id == current_user.id)\
        .first()
        
    if not notification:
        raise HTTPException(status_code=404, detail="Notification not found")
        
    notification.is_read = True
    db.commit()
    return {"status": "success"}

@router.put("/{notification_id}/read")
def mark_as_read(
    notification_id: int,
    db: Session = Depends(get_db),
    current_user: deps.User = Depends(deps.get_current_active_user)
):
    """Mark notification as read (PUT method)"""
    notification = db.query(notification_model.Notification)\
        .filter(notification_model.Notification.id == notification_id)\
        .filter(notification_model.Notification.user_id == current_user.id)\
        .first()
        
    if not notification:
        raise HTTPException(status_code=404, detail="Notification not found")
        
    notification.is_read = True
    db.commit()
    return {"status": "success"}

