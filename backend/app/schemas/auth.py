# backend/app/schemas/auth.py
from pydantic import BaseModel, EmailStr, field_validator
from datetime import datetime
from app.models.user import UserType
from typing import Optional

class UserBase(BaseModel):
    email: EmailStr
    full_name: str
    phone: str
    user_type: UserType
    region: str | None = None
    commune: str | None = None
    latitude: float | None = None
    longitude: float | None = None
    profile_picture: Optional[str] = None

class UserCreate(UserBase):
    password: str
    
    # Champs spécifiques selon type
    experience_years: int | None = None
    crop_types: list[str] | None = None
    intervention_zones: list[str] | None = None

    @field_validator("experience_years")
    def must_be_non_negative(cls, v):
        if v is not None and v < 0:
            raise ValueError("Experience years cannot be negative")
        return v

class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    phone: Optional[str] = None
    region: Optional[str] = None
    commune: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    address: Optional[str] = None
    profile_picture: Optional[str] = None
    intervention_zones: Optional[list[str]] = None
    crop_types: Optional[list[str]] = None

class PasswordChange(BaseModel):
    old_password: str
    new_password: str

class UserResponse(UserBase):
    id: int
    created_at: datetime
    is_active: bool
    
    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str


class LoginRequest(BaseModel):
    email: EmailStr
    password: str