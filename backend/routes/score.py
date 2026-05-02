from datetime import date

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from backend.database import get_db
from backend.models.daily_score import DailyScore
from backend.models.task import Task
from backend.models.user import User
from backend.schemas import DailyScoreComputationResponse, DailyScoreRequest, DailyScoreResponse
from backend.services.auth_service import get_current_user
from backend.services.score_service import compute_daily_metrics, compute_next_streak

router = APIRouter(tags=["score"])


@router.post("/score/daily", response_model=DailyScoreComputationResponse)
def compute_daily_score(
    payload: DailyScoreRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    target_user_id = payload.user_id or current_user.id
    if target_user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Forbidden")

    user = db.query(User).filter(User.id == target_user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    target_day = payload.day or date.today()
    tasks = (
        db.query(Task)
        .filter(Task.user_id == target_user_id, Task.date == target_day)
        .order_by(Task.created_at.asc())
        .all()
    )

    metrics = compute_daily_metrics(tasks=tasks, current_streak=user.streak)
    new_streak = compute_next_streak(metrics["success_rate"], user.streak)
    user.streak = new_streak

    existing = (
        db.query(DailyScore)
        .filter(DailyScore.user_id == target_user_id, DailyScore.date == target_day)
        .first()
    )

    if existing:
        existing.score = metrics["score"]
        existing.success_rate = metrics["success_rate"]
    else:
        existing = DailyScore(
            user_id=target_user_id,
            date=target_day,
            score=metrics["score"],
            success_rate=metrics["success_rate"],
        )
        db.add(existing)

    db.commit()

    return DailyScoreComputationResponse(
        date=target_day,
        score=metrics["score"],
        success_rate=metrics["success_rate"],
        streak=user.streak,
        multiplier=metrics["multiplier"],
        total_tasks=metrics["total_tasks"],
    )


@router.get("/score/history", response_model=list[DailyScoreResponse])
def score_history(
    user_id: int | None = Query(default=None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    target_user_id = user_id or current_user.id
    if target_user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Forbidden")

    user = db.query(User).filter(User.id == target_user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    records = (
        db.query(DailyScore)
        .filter(DailyScore.user_id == target_user_id)
        .order_by(DailyScore.date.asc())
        .all()
    )
    return records
