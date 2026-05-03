from datetime import date, timedelta, datetime
from collections import defaultdict

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
    
    # 1. Update Streak logic: Check consecutive days with at least one completed task
    # Find the last date the user had a completed task
    last_completed_date = None
    all_user_tasks = db.query(Task).filter(Task.user_id == target_user_id, Task.status == "completed").order_by(Task.date.desc()).all()
    if all_user_tasks:
        last_completed_date = all_user_tasks[0].date
    
    # Calculate current streak
    current_streak = 0
    if last_completed_date:
        check_date = last_completed_date
        while True:
            # Check if there's at least one completed task on check_date
            tasks_on_date = db.query(Task).filter(
                Task.user_id == target_user_id,
                Task.date == check_date,
                Task.status == "completed"
            ).first()
            if tasks_on_date:
                current_streak += 1
                check_date -= timedelta(days=1)
            else:
                break
    current_user.streak = current_streak

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

    success_rate = completed_count / len(tasks) if len(tasks) > 0 else 0.0
    
    # Streak multiplier
    multiplier = 1.0 + (min(current_user.streak, 10) * 0.1)
    base_score = (earned_weight / total_weight) * 100 if total_weight > 0 else 0
    final_score = base_score * multiplier

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


@router.get("/score/weekly-summary")
def weekly_summary(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    today = date.today()
    week_start = today - timedelta(days=today.weekday())
    week_end = week_start + timedelta(days=6)
    
    prev_week_start = week_start - timedelta(days=7)
    prev_week_end = prev_week_start + timedelta(days=6)
    
    # Current week tasks
    current_tasks = db.query(Task).filter(
        Task.user_id == current_user.id,
        Task.date >= week_start,
        Task.date <= week_end
    ).all()
    
    # Previous week tasks
    prev_tasks = db.query(Task).filter(
        Task.user_id == current_user.id,
        Task.date >= prev_week_start,
        Task.date <= prev_week_end
    ).all()
    
    current_total = len(current_tasks)
    current_completed = sum(1 for t in current_tasks if t.status == "completed")
    current_success = (current_completed / current_total) * 100 if current_total > 0 else 0
    
    prev_total = len(prev_tasks)
    prev_completed = sum(1 for t in prev_tasks if t.status == "completed")
    prev_success = (prev_completed / prev_total) * 100 if prev_total > 0 else 0
    
    success_change = 0
    if prev_success > 0:
        success_change = ((current_success - prev_success) / prev_success) * 100
    
    return {
        "current_week": {
            "total_tasks": current_total,
            "completed_tasks": current_completed,
            "success_rate": round(current_success, 1),
            "streak": current_user.streak
        },
        "previous_week": {
            "total_tasks": prev_total,
            "completed_tasks": prev_completed,
            "success_rate": round(prev_success, 1)
        },
        "success_change": round(success_change, 1)
    }


@router.get("/insights/smart")
def smart_insights(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    all_tasks = db.query(Task).filter(Task.user_id == current_user.id).all()
    
    if not all_tasks:
        return {
            "productive_hour": None,
            "failure_hour": None,
            "productive_day": None,
            "insights": []
        }
    
    completed_by_hour = defaultdict(int)
    failed_by_hour = defaultdict(int)
    completed_by_day = defaultdict(int)
    
    for task in all_tasks:
        if task.time:
            hour = int(task.time.split(':')[0])
            if task.status == "completed":
                completed_by_hour[hour] += 1
            elif task.status == "failed":
                failed_by_hour[hour] += 1
        
        if task.status == "completed" and task.date:
            day_of_week = task.date.weekday()
            completed_by_day[day_of_week] += 1
    
    # Find most productive hour
    productive_hour = None
    max_completed = 0
    for h, cnt in completed_by_hour.items():
        if cnt > max_completed:
            max_completed = cnt
            productive_hour = h
    
    # Find most failure-prone hour
    failure_hour = None
    max_failed = 0
    for h, cnt in failed_by_hour.items():
        if cnt > max_failed:
            max_failed = cnt
            failure_hour = h
    
    # Find most productive day
    productive_day = None
    max_day_completed = 0
    day_names = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
    for d, cnt in completed_by_day.items():
        if cnt > max_day_completed:
            max_day_completed = cnt
            productive_day = day_names[d]
    
    # Generate human-readable insights
    insights = []
    
    if productive_hour is not None:
        time_desc = "morning" if 5 <= productive_hour < 12 else "afternoon" if 12 <= productive_hour < 18 else "evening" if 18 <= productive_hour < 22 else "night"
        insights.append(f"You are more productive in the {time_desc} ({productive_hour}:00)")
    
    if failure_hour is not None:
        insights.append(f"You fail more tasks after {failure_hour}:00")
    
    if productive_day:
        insights.append(f"Your most productive day is {productive_day}")
    
    return {
        "productive_hour": productive_hour,
        "failure_hour": failure_hour,
        "productive_day": productive_day,
        "insights": insights
    }


@router.get("/tasks/missed")
def get_missed_tasks(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    today = date.today()
    # Get all tasks from yesterday and before that are failed or pending
    missed_tasks = db.query(Task).filter(
        Task.user_id == current_user.id,
        Task.date < today,
        Task.status.in_(["pending", "failed"])
    ).all()
    
    return {
        "count": len(missed_tasks),
        "tasks": [
            {
                "id": t.id,
                "title": t.title,
                "date": t.date,
                "status": t.status
            } for t in missed_tasks
        ]
    }
