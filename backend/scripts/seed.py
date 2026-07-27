from sqlalchemy.orm import Session
from app.database.session import SessionLocal
from app.models.company import Company
from app.models.user import User
from app.core.security import get_password_hash
import uuid

def seed():
    db = SessionLocal()
    try:
        # Check if user exists
        existing_user = db.query(User).filter(User.email == "new@gmail.com").first()
        if existing_user:
            print("User already exists!")
            return
            
        company_id = str(uuid.uuid4())
        company = Company(
            id=company_id,
            name="LogistiCore Default Company",
            contact_email="new@gmail.com"
        )
        db.add(company)
        
        user = User(
            id=str(uuid.uuid4()),
            company_id=company_id,
            email="new@gmail.com",
            password_hash=get_password_hash("112233"),
            role="admin",
            is_active=True
        )
        db.add(user)
        db.commit()
        print("Successfully created company and user!")
    finally:
        db.close()

if __name__ == "__main__":
    seed()
