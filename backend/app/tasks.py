from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.models.user import User
from app.services.notification import notify_user

def send_notification_task(user_id: int, message: str, notification_type: str = "info"):
    """
    Background task to send a notification and SMS.
    Creates its own database session.
    """
    db = SessionLocal()
    try:
        user = db.query(User).filter(User.id == user_id).first()
        if user:
            from app.services.notification import notify_user
            notify_user(db, user, message, notification_type)
            db.commit()
    except Exception as e:
        print(f"Error in background notification task: {e}")
        db.rollback()
    finally:
        db.close()

def find_matches_for_demand_task(demand_id: int):
    """Background task to find matches for a demand"""
    db = SessionLocal()
    try:
        from app.models.demand import Demand
        from app.services import matching
        demand = db.query(Demand).filter(Demand.id == demand_id).first()
        if demand:
            matching.find_matches_for_demand(db, demand)
            # find_matches_for_demand already commits
    except Exception as e:
        print(f"Error in background matching task (demand): {e}")
        db.rollback()
    finally:
        db.close()

def find_matches_for_offer_task(offer_id: int):
    """Background task to find matches for an offer"""
    db = SessionLocal()
    try:
        from app.models.offer import Offer
        from app.services import matching
        offer = db.query(Offer).filter(Offer.id == offer_id).first()
        if offer:
            matching.find_matches_for_offer(db, offer)
            # find_matches_for_offer already commits
    except Exception as e:
        print(f"Error in background matching task (offer): {e}")
        db.rollback()
    finally:
        db.close()
