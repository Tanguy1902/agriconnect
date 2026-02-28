from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from app.api import deps
from app.schemas import demand as demand_schema
from app.models import demand as demand_model
from app.models.user import UserType
from app.database import get_db

router = APIRouter()

@router.post("/", response_model=demand_schema.DemandResponse)
def create_demand(
    demand: demand_schema.DemandCreate,
    db: Session = Depends(get_db),
    current_user: deps.User = Depends(deps.get_current_active_user)
):
    if current_user.user_type.value == "agriculteur":
        raise HTTPException(status_code=403, detail="Only collectors can create demands")
    
    db_demand = demand_model.Demand(**demand.model_dump(), collector_id=current_user.id)
    db.add(db_demand)
    db.commit()
    db.refresh(db_demand)
    
    # Trigger matching
    from app.services import matching
    matching.find_matches_for_demand(db, db_demand)
    
    return db_demand

@router.get("/", response_model=List[demand_schema.DemandResponse])
def read_demands(
    skip: int = 0, 
    limit: int = 100, 
    product_id: Optional[int] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    status: Optional[str] = "active",
    db: Session = Depends(get_db)
):
    query = db.query(demand_model.Demand)
    
    if status:
        query = query.filter(demand_model.Demand.status == status)
    if product_id:
        query = query.filter(demand_model.Demand.product_id == product_id)
    if min_price is not None:
        query = query.filter(demand_model.Demand.max_unit_price >= min_price)
    if max_price is not None:
        query = query.filter(demand_model.Demand.max_unit_price <= max_price)
        
    demands = query.offset(skip).limit(limit).all()
    return demands


@router.get("/me", response_model=List[demand_schema.DemandResponse])
def read_my_demands(
    skip: int = 0, 
    limit: int = 100, 
    db: Session = Depends(get_db),
    current_user: deps.User = Depends(deps.get_current_active_user)
):
    demands = db.query(demand_model.Demand).filter(demand_model.Demand.collector_id == current_user.id).offset(skip).limit(limit).all()
    return demands

@router.get("/{demand_id}", response_model=demand_schema.DemandResponse)
def read_demand(
    demand_id: int,
    db: Session = Depends(get_db)
):
    """Get a specific demand by ID"""
    demand = db.query(demand_model.Demand).filter(demand_model.Demand.id == demand_id).first()
    if not demand:
        raise HTTPException(status_code=404, detail="Demand not found")
    return demand

@router.put("/{demand_id}", response_model=demand_schema.DemandResponse)
def update_demand(
    demand_id: int,
    demand_update: demand_schema.DemandUpdate,
    db: Session = Depends(get_db),
    current_user: deps.User = Depends(deps.get_current_active_user)
):
    """Update an existing demand (only by owner)"""
    # Get the demand
    demand = db.query(demand_model.Demand).filter(demand_model.Demand.id == demand_id).first()
    if not demand:
        raise HTTPException(status_code=404, detail="Demand not found")
    
    # Verify ownership
    if demand.collector_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to update this demand")
    
    # Update fields if provided
    update_data = demand_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(demand, field, value)
    
    db.commit()
    db.refresh(demand)
    
    return demand

@router.delete("/{demand_id}")
def delete_demand(
    demand_id: int,
    db: Session = Depends(get_db),
    current_user: deps.User = Depends(deps.get_current_active_user)
):
    """Delete a demand (only by owner)"""
    # Get the demand
    demand = db.query(demand_model.Demand).filter(demand_model.Demand.id == demand_id).first()
    if not demand:
        raise HTTPException(status_code=404, detail="Demand not found")
    
    # Verify ownership
    if demand.collector_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to delete this demand")
    
    # Delete associated matches
    from app.models.match import Match
    db.query(Match).filter(Match.demand_id == demand_id).delete()
    
    # Delete the demand
    db.delete(demand)
    db.commit()
    
    return {"status": "success", "message": "Demand deleted successfully"}

