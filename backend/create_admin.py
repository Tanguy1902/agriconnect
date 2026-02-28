import sys
import os
import getpass
from sqlalchemy.orm import Session

# Add the current directory to sys.path to import app
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.database import SessionLocal
from app import models # Register all models
from app.models.user import User, UserType
from app.utils import auth as auth_utils

def create_admin():
    print("--- Création d'un compte Administrateur ---")
    
    full_name = input("Nom complet : ")
    email = input("Email : ")
    phone = input("Téléphone : ")
    
    password = getpass.getpass("Mot de passe : ")
    password_confirm = getpass.getpass("Confirmez le mot de passe : ")
    
    if password != password_confirm:
        print("Erreur : Les mots de passe ne correspondent pas.")
        return

    db = SessionLocal()
    try:
        # Check if user already exists
        existing_user = db.query(User).filter(User.email == email).first()
        if existing_user:
            print(f"Erreur : Un utilisateur avec l'email {email} existe déjà.")
            return

        # Create admin user
        admin_user = User(
            full_name=full_name,
            email=email,
            phone=phone,
            hashed_password=auth_utils.hash_password(password),
            user_type=UserType.ADMIN,
            is_active=True
        )
        
        db.add(admin_user)
        db.commit()
        print(f"Succès : Le compte administrateur pour {email} a été créé.")
        
    except Exception as e:
        print(f"Une erreur est survenue : {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    create_admin()
