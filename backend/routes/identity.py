from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from backend.database import get_db
from backend.models.user import User
from backend.schemas import IdentityProfileResponse, ProfileUpdate
from backend.services.auth_service import get_current_user
from backend.services.identity_service import get_identity_profile

router = APIRouter(tags=["identity"])


@router.get("/identity/profile", response_model=IdentityProfileResponse)
def identity_profile(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return get_identity_profile(db, current_user)


@router.patch("/identity/profile")
def update_profile(
    payload: ProfileUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if payload.name is not None:
        current_user.name = payload.name.strip()
    if payload.username is not None:
        new_username = payload.username.strip().lower()
        if new_username != current_user.username:
            existing = db.query(User).filter(User.username == new_username).first()
            if existing:
                from fastapi import HTTPException
                raise HTTPException(status_code=400, detail="Username already taken")
            current_user.username = new_username
    if payload.avatar_url is not None:
        current_user.avatar_url = payload.avatar_url.strip() if payload.avatar_url.strip() else None
    
    db.commit()
    db.refresh(current_user)
    return {"message": "Profile updated", "name": current_user.name, "username": current_user.username, "avatar_url": current_user.avatar_url}
