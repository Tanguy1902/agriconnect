from pydantic import BaseModel, field_validator
from datetime import date, datetime
from typing import Optional
from app.models.demand import DemandStatus
from app.schemas.auth import UserResponse
from app.schemas.product import ProductResponse



class DemandBase(BaseModel):
    product_id: Optional[int] = None
    product_name: Optional[str] = None
    quantity: float
    max_unit_price: Optional[float] = None
    desired_delivery_date: Optional[date] = None
    quality_required: Optional[str] = None
    special_requirements: Optional[str] = None


class DemandCreate(DemandBase):
    @field_validator("desired_delivery_date")
    def date_must_be_future(cls, v):
        if v and v < date.today():
            raise ValueError("Delivery date cannot be in the past")
        return v

class DemandUpdate(BaseModel):
    quantity: Optional[float] = None
    max_unit_price: Optional[float] = None
    desired_delivery_date: Optional[date] = None
    quality_required: Optional[str] = None
    special_requirements: Optional[str] = None
    status: Optional[DemandStatus] = None

    @field_validator("desired_delivery_date")
    def date_must_be_future(cls, v):
        if v and v < date.today():
            raise ValueError("Delivery date cannot be in the past")
        return v


class DemandResponse(DemandBase):
    id: int
    collector_id: int
    status: DemandStatus
    created_at: datetime
    collector: Optional[UserResponse] = None
    product: Optional[ProductResponse] = None

    class Config:
        from_attributes = True
