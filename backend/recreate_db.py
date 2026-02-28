#!/usr/bin/env python3
"""
Script to recreate the database with the updated schema.
This will drop all existing tables and recreate them.
"""
import sys
import os

# Add the parent directory to the path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.database import Base, engine
from app.models import user, product, offer, demand, notification, direct_purchase, message

def recreate_database():
    """Drop all tables and recreate them with the current schema."""
    print("Dropping all existing tables...")
    Base.metadata.drop_all(bind=engine)
    
    print("Creating all tables with updated schema...")
    Base.metadata.create_all(bind=engine)
    
    print("✅ Database recreated successfully!")
    print("\nNext steps:")
    print("1. Create an admin user: python create_admin.py")
    print("2. Start the server: uvicorn app.main:app --reload")

if __name__ == "__main__":
    recreate_database()
