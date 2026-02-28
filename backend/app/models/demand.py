# backend/app/models/demand.py
from sqlalchemy import Column, Integer, Float, String, DateTime, Date, ForeignKey, Enum
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
import enum
from app.database import Base

class DemandStatus(str, enum.Enum):
    ACTIVE = "active"
    IN_NEGOTIATION = "in_negotiation"
    FULFILLED = "fulfilled"
    CANCELLED = "cancelled"

class Demand(Base):
    __tablename__ = "demands"
    
    id = Column(Integer, primary_key=True, index=True)
    collector_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=True)
    product_name = Column(String(100), nullable=True)
    
    # Spécifications
    quantity = Column(Float, nullable=False)
    max_unit_price = Column(Float)
    desired_delivery_date = Column(Date)
    quality_required = Column(String(50))
    special_requirements = Column(String(500))
    
    # Statut
    status = Column(Enum(DemandStatus), default=DemandStatus.ACTIVE)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relations
    collector = relationship("User", back_populates="demands")
    product = relationship("Product")
    matches = relationship("Match", back_populates="demand")