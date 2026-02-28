import sys
import os

# Add backend to path
sys.path.append(os.path.join(os.getcwd(), 'backend'))

from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.models.user import User, UserType

def fix_user_role(email, new_role):
    db = SessionLocal()
    try:
        user = db.query(User).filter(User.email == email).first()
        if user:
            print(f"Current role for {email}: {user.user_type}")
            if new_role == 'agriculteur':
                user.user_type = UserType.AGRICULTEUR
            elif new_role == 'collecteur':
                user.user_type = UserType.COLLECTEUR
            else:
                print(f"Invalid role: {new_role}")
                return
            
            db.commit()
            print(f"Success: Role updated to {user.user_type}")
        else:
            print(f"User with email {email} not found.")
    except Exception as e:
        print(f"Error: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    if len(sys.argv) > 2:
        fix_user_role(sys.argv[1], sys.argv[2])
    else:
        print("Usage: python fix_user_role.py <email> <agriculteur|collecteur>")
