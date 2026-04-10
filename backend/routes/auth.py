from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException
from sqlalchemy import or_
from sqlalchemy.orm import Session

from backend.database import get_db
from backend.models.user import User
from backend.schemas import AuthResponse, LoginRequest, SignupRequest
from backend.services.auth_service import create_access_token, hash_password, verify_password
from backend.services.email_service import send_login_notification, send_signup_confirmation

router = APIRouter(tags=["auth"])


@router.post("/signup", response_model=AuthResponse)
def signup(payload: SignupRequest, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    existing_user = db.query(User).filter(User.username == payload.username).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Username already exists")

    existing_email = db.query(User).filter(User.email == payload.email).first()
    if existing_email:
        raise HTTPException(status_code=400, detail="Email already exists")

    user = User(
        username=payload.username,
        email=payload.email,
        password=hash_password(payload.password),
        name=payload.name,
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    access_token = create_access_token(user_id=user.id, username=user.username)
    background_tasks.add_task(send_signup_confirmation, user.email, user.name)

    return AuthResponse(user_id=user.id, username=user.username, name=user.name, access_token=access_token)


@router.post("/login", response_model=AuthResponse)
def login(payload: LoginRequest, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    identifier = payload.username.strip()
    user = db.query(User).filter(or_(User.username == identifier, User.email == identifier)).first()
    if not user or not verify_password(payload.password, user.password):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    access_token = create_access_token(user_id=user.id, username=user.username)
    background_tasks.add_task(send_login_notification, user.email, user.name)
    return AuthResponse(user_id=user.id, username=user.username, name=user.name, access_token=access_token)
