# backend/app/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.api import auth, users, products, offers, demands, matches, notifications, direct_purchases, chats, statistics, admin
from app import models # Register models
from app.database import engine, Base

# Créer les tables (en développement)
Base.metadata.create_all(bind=engine)

from datetime import datetime, timezone
import json
from fastapi.encoders import jsonable_encoder
from fastapi.responses import JSONResponse

class UTCDateTimeEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, datetime):
            if obj.tzinfo is None:
                obj = obj.replace(tzinfo=timezone.utc)
            return obj.isoformat().replace('+00:00', 'Z')
        return super().default(obj)

app = FastAPI(
    title="Plateforme Agricole Madagascar",
    description="Plateforme de mise en relation agriculteurs-collecteurs",
    version="1.0.0",
)

# Override default JSON encoder behavior for datetimes
@app.middleware("http")
async def add_utc_tz_to_json(request, call_next):
    response = await call_next(request)
    # This is a bit complex for middleware, better to use custom encoders in schemas
    # But for SQLite naive datetimes, we'll keep the frontend fixes as primary
    return response

# CORS
origins = settings.CORS_ORIGINS.split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routes
# Routes
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(users.router, prefix="/api/users", tags=["Users"])
app.include_router(products.router, prefix="/api/products", tags=["Products"])
app.include_router(offers.router, prefix="/api/offers", tags=["Offers"])
app.include_router(demands.router, prefix="/api/demands", tags=["Demands"])
app.include_router(matches.router, prefix="/api/matches", tags=["Matches"])
app.include_router(notifications.router, prefix="/api/notifications", tags=["Notifications"])
app.include_router(direct_purchases.router, prefix="/api/direct-purchases", tags=["Direct Purchases"])
app.include_router(chats.router, prefix="/api/chats", tags=["Chats"])
app.include_router(statistics.router, prefix="/api/statistics", tags=["Statistics"])
app.include_router(admin.router, prefix="/api/admin", tags=["Admin"])

@app.get("/")
async def root():
    return {"message": "Plateforme Agricole API"}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "agriculture-platform"}

# Static Files
from fastapi.staticfiles import StaticFiles
import os

# Ensure directory exists
os.makedirs("static/uploads", exist_ok=True)

app.mount("/static", StaticFiles(directory="static"), name="static")