from pydantic import BaseModel, field_validator
from datetime import datetime
from typing import Optional
from app.models.offer import OfferStatus
from app.schemas.auth import UserResponse
from app.schemas.product import ProductResponse


class OfferBase(BaseModel):
    product_id: int
    quantity: float
    unit_price: float
    quality: Optional[str] = None
    description: Optional[str] = None
    harvest_date: Optional[datetime] = None
    location_region: Optional[str] = None
    location_commune: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    image_url: Optional[str] = None



class OfferCreate(OfferBase):
    @field_validator("quantity", "unit_price")
    def must_be_positive(cls, v):
        if v <= 0:
            raise ValueError("Must be greater than zero")
        return v


class OfferUpdate(BaseModel):
    quantity: Optional[float] = None
    unit_price: Optional[float] = None
    quality: Optional[str] = None
    description: Optional[str] = None
    status: Optional[OfferStatus] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    image_url: Optional[str] = None

    @field_validator("quantity", "unit_price")
    def must_be_positive(cls, v):
        if v is not None and v <= 0:
            raise ValueError("Must be greater than zero")
        return v



class OfferResponse(OfferBase):
    id: int
    farmer_id: int
    status: OfferStatus
    created_at: datetime
    updated_at: Optional[datetime] = None
    farmer: Optional[UserResponse] = None
    product: Optional[ProductResponse] = None

    class Config:
        from_attributes = True
