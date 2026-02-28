from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.api import deps
from app.database import get_db
from app.models.user import User, UserType
from app.models.offer import Offer
from app.models.demand import Demand
from app.models.product import Product
from app.schemas import auth
from typing import List, Dict, Any
import csv
import io
from fastapi.responses import StreamingResponse

router = APIRouter()

def check_admin(current_user: User = Depends(deps.get_current_active_user)):
    if current_user.user_type != UserType.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="The user doesn't have enough privileges"
        )
    return current_user

@router.get("/users", response_model=List[auth.UserResponse])
async def get_all_users(
    db: Session = Depends(get_db),
    admin_user: User = Depends(check_admin)
):
    """Get all users (admin only)"""
    return db.query(User).all()

@router.put("/users/{user_id}/toggle-active")
async def toggle_user_active(
    user_id: int,
    db: Session = Depends(get_db),
    admin_user: User = Depends(check_admin)
):
    """Toggle user active status (admin only)"""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    if user.id == admin_user.id:
        raise HTTPException(status_code=400, detail="Cannot deactivate yourself")
        
    user.is_active = not user.is_active
    db.commit()
    db.refresh(user)
    return {"status": "success", "is_active": user.is_active}

@router.get("/stats", response_model=Dict[str, Any])
async def get_platform_stats(
    db: Session = Depends(get_db),
    admin_user: User = Depends(check_admin)
):
    """Get platform statistics (admin only)"""
    total_users = db.query(func.count(User.id)).scalar()
    total_farmers = db.query(func.count(User.id)).filter(User.user_type == UserType.AGRICULTEUR).scalar()
    total_collectors = db.query(func.count(User.id)).filter(User.user_type == UserType.COLLECTEUR).scalar()
    
    total_offers = db.query(func.count(Offer.id)).scalar()
    total_demands = db.query(func.count(Demand.id)).scalar()
    total_products = db.query(func.count(Product.id)).scalar()
    
    return {
        "users": {
            "total": total_users,
            "farmers": total_farmers,
            "collectors": total_collectors
        },
        "content": {
            "offers": total_offers,
            "demands": total_demands,
            "products": total_products
        }
    }

@router.get("/export/users")
async def export_users_csv(
    db: Session = Depends(get_db),
    admin_user: User = Depends(check_admin)
):
    """Export all users to CSV (admin only)"""
    users = db.query(User).all()
    
    output = io.StringIO()
    writer = csv.writer(output)
    
    # Header
    writer.writerow(["ID", "Full Name", "Email", "User Type", "Region", "Commune", "Active", "Created At"])
    
    # Data
    for user in users:
        writer.writerow([
            user.id,
            user.full_name,
            user.email,
            user.user_type,
            user.location_region,
            user.location_commune,
            user.is_active,
            user.created_at
        ])
    
    output.seek(0)
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=users_export.csv"}
    )

@router.get("/export/stats")
async def export_stats_csv(
    db: Session = Depends(get_db),
    admin_user: User = Depends(check_admin)
):
    """Export platform statistics to CSV (admin only)"""
    total_users = db.query(func.count(User.id)).scalar()
    total_farmers = db.query(func.count(User.id)).filter(User.user_type == UserType.AGRICULTEUR).scalar()
    total_collectors = db.query(func.count(User.id)).filter(User.user_type == UserType.COLLECTEUR).scalar()
    total_offers = db.query(func.count(Offer.id)).scalar()
    total_demands = db.query(func.count(Demand.id)).scalar()
    total_products = db.query(func.count(Product.id)).scalar()
    
    output = io.StringIO()
    writer = csv.writer(output)
    
    writer.writerow(["Metric", "Value"])
    writer.writerow(["Total Users", total_users])
    writer.writerow(["Farmers", total_farmers])
    writer.writerow(["Collectors", total_collectors])
    writer.writerow(["Total Offers", total_offers])
    writer.writerow(["Total Demands", total_demands])
    writer.writerow(["Total Products", total_products])
    
    output.seek(0)
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=platform_stats.csv"}
    )
