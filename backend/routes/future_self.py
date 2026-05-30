from datetime import date, datetime, timedelta
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from backend.database import get_db
from backend.models.future_self import FutureSelfMessage
from backend.models.user import User
from backend.services.auth_service import get_current_user

router = APIRouter(tags=["future_self"])


# ── Schemas ──────────────────────────────────────────────────────────────────

class FutureSelfCreate(BaseModel):
    title: str
    message: str
    category: str = "general"  # goal | promise | prediction | reminder | motivational
    delivery: str = "1_week"   # 1_week | 1_month | 3_months | 6_months | 1_year


class FutureSelfResponse(BaseModel):
    id: int
    title: str
    message: str
    category: str
    open_date: date
    created_at: datetime
    is_opened: bool
    opened_at: Optional[datetime] = None
    days_until_open: int

    class Config:
        from_attributes = True


# ── Helpers ───────────────────────────────────────────────────────────────────

DELIVERY_DELTAS = {
    "1_week":    timedelta(weeks=1),
    "1_month":   timedelta(days=30),
    "3_months":  timedelta(days=91),
    "6_months":  timedelta(days=182),
    "1_year":    timedelta(days=365),
}


def _days_until(open_date: date) -> int:
    delta = (open_date - date.today()).days
    return max(delta, 0)


def _to_response(msg: FutureSelfMessage) -> FutureSelfResponse:
    return FutureSelfResponse(
        id=msg.id,
        title=msg.title,
        message=msg.message if msg.is_opened else "",      # hide contents until opened
        category=msg.category,
        open_date=msg.open_date,
        created_at=msg.created_at,
        is_opened=msg.is_opened,
        opened_at=msg.opened_at,
        days_until_open=_days_until(msg.open_date),
    )


# ── Routes ────────────────────────────────────────────────────────────────────

@router.post("/future-self", response_model=FutureSelfResponse)
def create_future_self(
    payload: FutureSelfCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    delta = DELIVERY_DELTAS.get(payload.delivery)
    if not delta:
        raise HTTPException(status_code=400, detail="Invalid delivery option")

    open_date = date.today() + delta
    msg = FutureSelfMessage(
        user_id=current_user.id,
        title=payload.title,
        message=payload.message,
        category=payload.category,
        open_date=open_date,
        is_opened=False,
    )
    db.add(msg)
    db.commit()
    db.refresh(msg)
    return _to_response(msg)


@router.get("/future-self", response_model=list[FutureSelfResponse])
def list_future_self(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    messages = (
        db.query(FutureSelfMessage)
        .filter(FutureSelfMessage.user_id == current_user.id)
        .order_by(FutureSelfMessage.open_date.asc())
        .all()
    )
    return [_to_response(m) for m in messages]


@router.get("/future-self/ready", response_model=list[FutureSelfResponse])
def list_ready_future_self(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Messages whose open_date has passed and haven't been opened yet."""
    today = date.today()
    messages = (
        db.query(FutureSelfMessage)
        .filter(
            FutureSelfMessage.user_id == current_user.id,
            FutureSelfMessage.open_date <= today,
            FutureSelfMessage.is_opened == False,  # noqa: E712
        )
        .all()
    )
    return [_to_response(m) for m in messages]


@router.patch("/future-self/{message_id}/open", response_model=FutureSelfResponse)
def open_future_self(
    message_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    msg = db.query(FutureSelfMessage).filter(FutureSelfMessage.id == message_id).first()
    if not msg:
        raise HTTPException(status_code=404, detail="Message not found")
    if msg.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Forbidden")
    if date.today() < msg.open_date:
        raise HTTPException(status_code=400, detail="This message is not ready to be opened yet")

    msg.is_opened = True
    msg.opened_at = datetime.utcnow()
    db.commit()
    db.refresh(msg)

    # After marking as opened, return with full message content
    return FutureSelfResponse(
        id=msg.id,
        title=msg.title,
        message=msg.message,
        category=msg.category,
        open_date=msg.open_date,
        created_at=msg.created_at,
        is_opened=msg.is_opened,
        opened_at=msg.opened_at,
        days_until_open=0,
    )


@router.delete("/future-self/{message_id}")
def delete_future_self(
    message_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    msg = db.query(FutureSelfMessage).filter(FutureSelfMessage.id == message_id).first()
    if not msg:
        raise HTTPException(status_code=404, detail="Message not found")
    if msg.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Forbidden")
    db.delete(msg)
    db.commit()
    return {"detail": "Deleted"}
