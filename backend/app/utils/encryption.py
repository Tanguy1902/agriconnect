from cryptography.fernet import Fernet
from app.config import settings

ENCRYPTION_KEY = settings.ENCRYPTION_KEY

if not ENCRYPTION_KEY:
    # Fallback for development if not in .env
    ENCRYPTION_KEY = Fernet.generate_key().decode()

fernet = Fernet(ENCRYPTION_KEY.encode())


def encrypt_message(message: str) -> str:
    """Encrypt a message string"""
    if not message:
        return ""
    return fernet.encrypt(message.encode()).decode()


def decrypt_message(encrypted_message: str) -> str:
    """Decrypt an encrypted message string"""
    if not encrypted_message:
        return ""
    try:
        return fernet.decrypt(encrypted_message.encode()).decode()
    except Exception:
        # If decryption fails (e.g. old plain text messages), return as is
        return encrypted_message
