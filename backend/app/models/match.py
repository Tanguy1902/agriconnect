# backend/app/models/match.py
from sqlalchemy import Column, Integer, Float, String, DateTime, ForeignKey, Enum
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
import enum
from app.database import Base

class MatchStatus(str, enum.Enum):
    PENDING = "pending"
    ACCEPTED = "accepted"
    REJECTED = "rejected"
    NEGOTIATING = "negotiating"
    COMPLETED = "completed"

class Match(Base):
    __tablename__ = "matches"
    
    id = Column(Integer, primary_key=True, index=True)
    offer_id = Column(Integer, ForeignKey("offers.id"), nullable=False)
    demand_id = Column(Integer, ForeignKey("demands.id"), nullable=False)
    
    # Score de matching
    match_score = Column(Float, nullable=False)  # 0-100
    matching_reason = Column(String(500))  # Pourquoi ce match?
    
    # Négociation
    negotiated_price = Column(Float)
    negotiated_quantity = Column(Float)
    delivery_terms = Column(String(500))
    
    # Statut
    status = Column(Enum(MatchStatus), default=MatchStatus.PENDING)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relations
    offer = relationship("Offer", back_populates="matches")
    demand = relationship("Demand", back_populates="matches")