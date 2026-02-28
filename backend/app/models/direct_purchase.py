from sqlalchemy import Column, Integer, Float, String, DateTime, ForeignKey, Enum
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
import enum
from app.database import Base

class DirectPurchaseStatus(str, enum.Enum):
    PENDING = "pending"
    ACCEPTED = "accepted"
    REJECTED = "rejected"
    CANCELLED = "cancelled"

class DirectPurchase(Base):
    __tablename__ = "direct_purchases"
    
    id = Column(Integer, primary_key=True, index=True)
    collector_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    offer_id = Column(Integer, ForeignKey("offers.id"), nullable=False)
    
    # Details of the purchase offer
    quantity = Column(Float, nullable=False)
    unit_price = Column(Float, nullable=False)  # Proposed price
    message = Column(String(500))
    
    # Status
    status = Column(Enum(DirectPurchaseStatus), default=DirectPurchaseStatus.PENDING)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relations
    collector = relationship("User", back_populates="direct_purchases")
    offer = relationship("Offer", back_populates="direct_purchases")
