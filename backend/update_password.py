import sys
from app.db.session import SessionLocal
from app.core.security import get_password_hash

def update_password(email: str, new_password: str):
    """Update password for a user."""
    db = SessionLocal()
    try:
        user = db.query(User).filter(User.email == email).first()
        if not user:
            print(f"User {email} not found.")
            return False

        user.hashed_password = get_password_hash(new_password)
        db.commit()
        print(f"Password updated successfully for {email}")
        return True
    except Exception as e:
        db.rollback()
        print(f"Error updating password: {e}")
        return False
    finally:
        db.close()

if __name__ == "__main__":
    if len(sys.argv) != 3:
        print("Usage: python update_password.py <email> <new_password>")
        sys.exit(1)
    
    from app.models.user import User  # Import here to avoid circular imports
    email = sys.argv[1]
    new_password = sys.argv[2]
    update_password(email, new_password)