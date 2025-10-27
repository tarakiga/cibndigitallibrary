from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from typing import Optional
from app.db.session import get_db
from app.core.security import decode_access_token
from app.models import User, UserRole
from app.services.auth import get_current_user

security = HTTPBearer()
optional_security = HTTPBearer(auto_error=False)


def get_current_user_dependency(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
) -> User:
    """Dependency to get current authenticated user."""
    token = credentials.credentials
    payload = decode_access_token(token)
    
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token"
        )
    
    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token payload"
        )
    
    return get_current_user(db, int(user_id))


def get_optional_user_dependency(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(optional_security),
    db: Session = Depends(get_db)
) -> Optional[User]:
    """Dependency to get current user if authenticated, None otherwise."""
    if not credentials:
        return None
    
    try:
        token = credentials.credentials
        payload = decode_access_token(token)
        
        if not payload:
            return None
        
        user_id = payload.get("sub")
        if not user_id:
            return None
        
        return get_current_user(db, int(user_id))
    except:
        return None


def require_cibn_member(
    current_user: User = Depends(get_current_user_dependency)
) -> User:
    """Dependency to require CIBN member or admin role."""
    if current_user.role not in [UserRole.CIBN_MEMBER, UserRole.ADMIN]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="CIBN membership required"
        )
    return current_user


def require_admin(
    current_user: User = Depends(get_current_user_dependency)
) -> User:
    """Dependency to require admin role."""
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin privileges required"
        )
    return current_user
