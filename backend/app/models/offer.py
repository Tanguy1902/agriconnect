
from sqlalchemy import Column, Integer, Float, String, DateTime, ForeignKey, Enum
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
import enum
from app.database import Base

class OfferStatus(str, enum.Enum):
    ACTIVE = "active"
    RESERVED = "reserved"
    COMPLETED = "completed"
    EXPIRED = "expired"
    SOLD = "sold"

class Offer(Base):
    __tablename__ = "offers"
    
    id = Column(Integer, primary_key=True, index=True)
    farmer_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    
    # Détails
    quantity = Column(Float, nullable=False)  # en unité du produit
    unit_price = Column(Float, nullable=False)  # prix par unité
    quality = Column(String(50))  # A, B, C, Bio, etc.
    description = Column(String(500))
    image_url = Column(String(500), nullable=True)
    
    # Localisation
    harvest_date = Column(DateTime)
    location_region = Column(String(100))
    location_commune = Column(String(100))
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    
    # Statut
    status = Column(Enum(OfferStatus), default=OfferStatus.ACTIVE)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relations
    farmer = relationship("User", back_populates="offers")
    product = relationship("Product")
    matches = relationship("Match", back_populates="offer")
    direct_purchases = relationship("DirectPurchase", back_populates="offer", cascade="all, delete-orphan")