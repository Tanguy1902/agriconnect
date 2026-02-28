from pydantic import BaseModel, field_validator
from datetime import datetime
from typing import Optional, ForwardRef
from app.models.direct_purchase import DirectPurchaseStatus
from app.schemas.auth import UserResponse


class DirectPurchaseBase(BaseModel):
    quantity: float
    unit_price: float
    message: Optional[str] = None


class DirectPurchaseCreate(DirectPurchaseBase):
    offer_id: int

    @field_validator("quantity", "unit_price")
    def must_be_positive(cls, v):
        if v <= 0:
            raise ValueError("Must be greater than zero")
        return v


class DirectPurchaseUpdate(BaseModel):
    status: DirectPurchaseStatus


class DirectPurchaseResponse(DirectPurchaseBase):
    id: int
    collector_id: int
    offer_id: int
    status: DirectPurchaseStatus
    created_at: datetime
    updated_at: Optional[datetime] = None

    # Include the collector and offer details
    collector: Optional[UserResponse] = None
    offer: Optional[ForwardRef('OfferResponse')] = None

    class Config:
        from_attributes = True

# Import at the end to avoid circular dependency and rebuild model
from app.schemas.offer import OfferResponse  # noqa: E402


DirectPurchaseResponse.model_rebuild()
