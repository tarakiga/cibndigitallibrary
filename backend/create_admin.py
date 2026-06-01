import sys
import logging
from app.db.session import SessionLocal
from app.models.user import User, UserRole
from app.core.security import get_password_hash

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def create_superuser(email, password):
    db = SessionLocal()
    try:
        user = db.query(User).filter(User.email == email).first()
        if user:
            logger.info(f"User {email} already exists.")
            return

        hashed_password = get_password_hash(password)
        db_user = User(
            email=email,
            hashed_password=hashed_password,
            full_name="Admin User",
            role=UserRole.ADMIN,
            is_active=True,
            is_verified=True
        )
        db.add(db_user)
        db.commit()
        db.refresh(db_user)
        logger.info(f"Superuser {email} created successfully!")
    except Exception as e:
        logger.error(f"Error creating superuser: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    if len(sys.argv) != 3:
        print("Usage: python create_admin.py <email> <password>")
        sys.exit(1)
    
    email = sys.argv[1]
    password = sys.argv[2]
    create_superuser(email, password)
