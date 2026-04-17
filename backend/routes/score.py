from datetime import date, timedelta

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

    day = payload.day or date.today()
    
    # 1. Update Streak logic
    yesterday = day - timedelta(days=1)
    
    # Check if user had any tasks yesterday
    yesterday_tasks = db.query(Task).filter(Task.user_id == target_user_id, Task.date == yesterday).all()
    if yesterday_tasks:
        # If there were tasks, at least one must be completed to maintain streak
        completed_yesterday = any(t.status == "completed" for t in yesterday_tasks)
        if not completed_yesterday:
            current_user.streak = 0
    else:
        # If no tasks yesterday, we don't necessarily break the streak, 
        # but let's check the day before that if we want to be strict.
        # For simplicity, we only reset if there WERE tasks and none were done.
        pass

    tasks = db.query(Task).filter(Task.user_id == target_user_id, Task.date == day).all()
    if not tasks:
        db.commit()
        return DailyScoreComputationResponse(
            date=day, score=0.0, success_rate=0.0, streak=current_user.streak, multiplier=1.0, total_tasks=0
        )

    # 2. Compute Score with Difficulty & Priority weights
    difficulty_map = {"easy": 1, "medium": 2, "hard": 3}
    priority_map = {"low": 1, "medium": 1.5, "high": 2}
    
    total_weight = 0
    earned_weight = 0
    completed_count = 0

    for task in tasks:
        weight = difficulty_map.get(task.difficulty, 1) * priority_map.get(task.priority, 1)
        total_weight += weight
        if task.status == "completed":
            earned_weight += weight
            completed_count += 1

    success_rate = completed_count / len(tasks)
    
    # Streak multiplier
    multiplier = 1.0 + (min(current_user.streak, 10) * 0.1)
    base_score = (earned_weight / total_weight) * 100 if total_weight > 0 else 0
    final_score = base_score * multiplier

    # 3. Update streak if all tasks today are completed
    if success_rate == 1.0:
        # Check if we already updated streak today
        today_score = db.query(DailyScore).filter(DailyScore.user_id == target_user_id, DailyScore.date == day).first()
        if not today_score:
            current_user.streak += 1

    # 4. Save/Update DailyScore
    daily_score = db.query(DailyScore).filter(DailyScore.user_id == target_user_id, DailyScore.date == day).first()
    if not daily_score:
        daily_score = DailyScore(user_id=target_user_id, date=day, score=final_score, success_rate=success_rate)
        db.add(daily_score)
    else:
        daily_score.score = final_score
        daily_score.success_rate = success_rate

    db.commit()

    return DailyScoreComputationResponse(
        date=day,
        score=final_score,
        success_rate=success_rate,
        streak=current_user.streak,
        multiplier=multiplier,
        total_tasks=len(tasks),
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
