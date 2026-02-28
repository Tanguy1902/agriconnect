from pydantic import BaseModel, field_validator, ConfigDict
from typing import Optional


class ProductBase(BaseModel):
    name: str
    category: str
    unit: str
    description: Optional[str] = None
    image_url: Optional[str] = None
    quality_standards: Optional[str] = None  # JSON string

    @field_validator("name", "unit", "category")
    def not_empty(cls, v):
        if not v.strip():
            raise ValueError("Field cannot be empty")
        return v


class ProductCreate(ProductBase):
    pass


class ProductUpdate(BaseModel):
    name: Optional[str] = None
    category: Optional[str] = None
    unit: Optional[str] = None
    description: Optional[str] = None
    image_url: Optional[str] = None
    quality_standards: Optional[str] = None


class ProductResponse(ProductBase):
    id: int
    offer_count: Optional[int] = 0

    model_config = ConfigDict(from_attributes=True)
