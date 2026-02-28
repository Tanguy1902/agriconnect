# backend/app/api/auth.py - VERSION CORRIGÉE
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from app.schemas import auth
from app.models import user
from app.utils import auth as auth_utils
from app.database import get_db

router = APIRouter()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/auth/login")

@router.post("/register", response_model=auth.UserResponse)
async def register(user_data: auth.UserCreate, db: Session = Depends(get_db)):
    # Vérifier si l'email existe déjà
    existing_user = db.query(user.User).filter(user.User.email == user_data.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email déjà utilisé"
        )
    
    # Créer l'utilisateur
    hashed_password = auth_utils.hash_password(user_data.password)
    
    db_user = user.User(
        email=user_data.email,
        hashed_password=hashed_password,
        full_name=user_data.full_name,
        phone=user_data.phone,
        user_type=user_data.user_type,
        location_region=user_data.region,
        location_commune=user_data.commune,
        experience_years=user_data.experience_years,
        crop_types=str(user_data.crop_types) if user_data.crop_types else None,
        intervention_zones=str(user_data.intervention_zones) if user_data.intervention_zones else None,
    )
    
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    
    return db_user

@router.post("/login", response_model=auth.Token)
async def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    # CHANGER 'user' en 'user_record' ou 'db_user'
    user_record = db.query(user.User).filter(user.User.email == form_data.username).first()
    
    if not user_record or not auth_utils.verify_password(form_data.password, user_record.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email ou mot de passe incorrect",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    if not user_record.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Compte désactivé"
        )
    
    access_token = auth_utils.create_access_token(
        data={"sub": user_record.email, "user_id": user_record.id, "user_type": user_record.user_type}
    )
    
    return {"access_token": access_token, "token_type": "bearer"}