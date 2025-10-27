import os
import sys

# Ensure backend root is on sys.path so `app.*` imports work when running as a script
CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
BACKEND_ROOT = os.path.abspath(os.path.join(CURRENT_DIR, ".."))
if BACKEND_ROOT not in sys.path:
    sys.path.insert(0, BACKEND_ROOT)

from sqlalchemy.orm import Session  # noqa: E402
from app.db.session import SessionLocal  # noqa: E402
from app.models.user import User, UserRole  # noqa: E402
from app.core.security import get_password_hash  # noqa: E402


def upsert_admin(db: Session, email: str, password: str, full_name: str | None = None, phone: str | None = None) -> None:
    full_name = full_name or "Admin User"
    user = db.query(User).filter(User.email == email).first()
    if user:
        user.hashed_password = get_password_hash(password)
        if not user.full_name:
            user.full_name = full_name
        if phone and not user.phone:
            user.phone = phone
        user.role = UserRole.ADMIN
        user.is_active = True
        user.is_verified = True
        db.commit()
        print(f"Updated existing user {email} to admin.")
    else:
        user = User(
            email=email,
            hashed_password=get_password_hash(password),
            full_name=full_name,
            phone=phone,
            role=UserRole.ADMIN,
            is_active=True,
            is_verified=True,
        )
        db.add(user)
        db.commit()
        print(f"Created admin user {email}.")


def main() -> int:
    email = os.environ.get("ADMIN_EMAIL")
    password = os.environ.get("ADMIN_PASSWORD")
    full_name = os.environ.get("ADMIN_FULL_NAME")
    phone = os.environ.get("ADMIN_PHONE")

    if not email or not password:
        print("ADMIN_EMAIL and ADMIN_PASSWORD environment variables are required", file=sys.stderr)
        return 1

    db = SessionLocal()
    try:
        upsert_admin(db, email=email, password=password, full_name=full_name, phone=phone)
    finally:
        db.close()
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
