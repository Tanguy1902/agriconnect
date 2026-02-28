# backend/app/models/product.py
from sqlalchemy import Column, Integer, String, Text
from app.database import Base

class Product(Base):
    __tablename__ = "products"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    category = Column(String(50), nullable=False)  # Fruits, Légumes, Céréales, etc.
    unit = Column(String(20), nullable=False)  # kg, tonne, sac, etc.
    description = Column(Text)
    image_url = Column(String(500))
    
    # Standardisation pour le matching
    quality_standards = Column(String)  # JSON: {"grade": ["A", "B", "C"]}