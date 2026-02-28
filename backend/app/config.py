# backend/app/config.py
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    DATABASE_URL: str
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    CORS_ORIGINS: str = "http://localhost:3000,http://127.0.0.1:3000,http://localhost:8081,http://127.0.0.1:8081,http://192.168.88.109:8081,http://192.168.1.50:8081,http://192.168.1.50:8081"
    SMSMODE_API_KEY: str = ""
    SMS_PARTNER_API_KEY: str = ""
    ENCRYPTION_KEY: str = ""
    
    class Config:
        env_file = ".env"

settings = Settings()