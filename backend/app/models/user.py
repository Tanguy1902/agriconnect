# backend/app/models/user.py
from sqlalchemy import Column, Float, Integer, String, Boolean, DateTime, Enum
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
import enum
from app.database import Base

class UserType(str, enum.Enum):
    AGRICULTEUR = "agriculteur"
    COLLECTEUR = "collecteur"
    ADMIN = "admin"

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    user_type = Column(Enum(UserType), nullable=False)
    full_name = Column(String(255), nullable=False)
    phone = Column(String(50), nullable=False)
    profile_picture = Column(String(255))
    
    # Localisation
    location_region = Column(String(100))
    location_commune = Column(String(100))
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    
    # Métier spécifique
    experience_years = Column(Integer, default=0)
    farm_description = Column(String(500))
    crop_types = Column(String)  # JSON string ou liste
    
    # Pour collecteur
    intervention_zones = Column(String)  # JSON
    collection_capacity = Column(String(100))
    
    # Dates
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    is_active = Column(Boolean, default=True)
    
    # Relations
    offers = relationship("Offer", back_populates="farmer", cascade="all, delete-orphan")
    demands = relationship("Demand", back_populates="collector", cascade="all, delete-orphan")
    notifications = relationship("Notification", back_populates="user", cascade="all, delete-orphan")
    direct_purchases = relationship("DirectPurchase", back_populates="collector", cascade="all, delete-orphan")
    
    # Chat relationships
    sent_messages = relationship("Message", foreign_keys="[Message.sender_id]", back_populates="sender", cascade="all, delete-orphan")
    received_messages = relationship("Message", foreign_keys="[Message.recipient_id]", back_populates="recipient", cascade="all, delete-orphan")