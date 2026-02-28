from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func, and_
from datetime import datetime, timedelta
from app.api import deps
from app.database import get_db
from app.models.offer import Offer, OfferStatus
from app.models.demand import Demand, DemandStatus
from app.models.direct_purchase import DirectPurchase, DirectPurchaseStatus
from app.models.match import Match
from app.models.user import UserType

from app.models.message import Message
from app.models.notification import Notification

router = APIRouter()

@router.get("/farmer")
def get_farmer_stats(
    db: Session = Depends(get_db),
    current_user: deps.User = Depends(deps.get_current_active_user)
):
    """Get statistics for the farmer dashboard"""
    if current_user.user_type.value != UserType.AGRICULTEUR.value:
        return {"error": "Only farmers can access these stats"}

    # 1. Active offers count
    active_offers_count = db.query(Offer).filter(
        Offer.farmer_id == current_user.id,
        Offer.status == OfferStatus.ACTIVE.value
    ).count()

    # 2. Active orders count (Accepted but not completed/cancelled)
    active_orders_count = db.query(DirectPurchase).join(Offer).filter(
        Offer.farmer_id == current_user.id,
        DirectPurchase.status == DirectPurchaseStatus.ACCEPTED.value
    ).count()

    # 3. Monthly revenue (Sum of accepted purchases this month)
    start_of_month = datetime.now().replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    monthly_revenue = db.query(func.sum(DirectPurchase.quantity * DirectPurchase.unit_price)).join(Offer).filter(
        Offer.farmer_id == current_user.id,
        DirectPurchase.status == DirectPurchaseStatus.ACCEPTED.value,
        DirectPurchase.updated_at >= start_of_month
    ).scalar() or 0

    # 4. Unread messages count
    unread_messages_count = db.query(Message).filter(
        Message.recipient_id == current_user.id,
        Message.is_read == False
    ).count()

    # 5. Recent activity (Last 5 notifications)
    recent_activity = db.query(Notification).filter(
        Notification.user_id == current_user.id
    ).order_by(Notification.created_at.desc()).limit(5).all()

    return {
        "active_offers_count": active_offers_count,
        "active_orders_count": active_orders_count,
        "monthly_revenue": float(monthly_revenue),
        "unread_messages_count": unread_messages_count,
        "recent_activity": recent_activity
    }

@router.get("/collector")
def get_collector_stats(
    db: Session = Depends(get_db),
    current_user: deps.User = Depends(deps.get_current_active_user)
):
    """Get statistics for the collector dashboard"""
    if current_user.user_type.value != UserType.COLLECTEUR.value:
        return {"error": "Only collectors can access these stats"}

    # 1. Active demands count
    active_demands_count = db.query(Demand).filter(
        Demand.collector_id == current_user.id,
        Demand.status == DemandStatus.ACTIVE
    ).count()

    # 2. New matches count (Matches created in the last 7 days)
    last_week = datetime.now() - timedelta(days=7)
    new_offers_count = db.query(Match).join(Demand).filter(
        Demand.collector_id == current_user.id,
        Match.created_at >= last_week
    ).count()

    # 3. Monthly expenses (Sum of accepted purchases this month)
    start_of_month = datetime.now().replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    monthly_expenses = db.query(func.sum(DirectPurchase.quantity * DirectPurchase.unit_price)).filter(
        DirectPurchase.collector_id == current_user.id,
        DirectPurchase.status == DirectPurchaseStatus.ACCEPTED,
        DirectPurchase.updated_at >= start_of_month
    ).scalar() or 0

    # 4. Unread messages count
    unread_messages_count = db.query(Message).filter(
        Message.recipient_id == current_user.id,
        Message.is_read == False
    ).count()

    # 5. Recent activity (Last 5 notifications)
    recent_activity = db.query(Notification).filter(
        Notification.user_id == current_user.id
    ).order_by(Notification.created_at.desc()).limit(5).all()

    return {
        "active_demands_count": active_demands_count,
        "new_offers_count": new_offers_count,
        "monthly_expenses": float(monthly_expenses),
        "unread_messages_count": unread_messages_count,
        "recent_activity": recent_activity
    }
