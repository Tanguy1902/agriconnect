import sys
import os

# Add backend to path
sys.path.append(os.path.join(os.getcwd(), 'backend'))

from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.models.user import User

def check_user(email):
    db = SessionLocal()
    try:
        user = db.query(User).filter(User.email == email).first()
        if user:
            print(f"User: {user.email}")
            print(f"Full Name: {user.full_name}")
            print(f"Type (raw): {user.user_type}")
            print(f"Type (value): {user.user_type.value if hasattr(user.user_type, 'value') else 'N/A'}")
        else:
            print(f"User with email {email} not found.")
    finally:
        db.close()

if __name__ == "__main__":
    if len(sys.argv) > 1:
        check_user(sys.argv[1])
    else:
        print("Usage: python inspect_user.py <email>")
