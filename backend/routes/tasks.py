from datetime import date, datetime, timedelta
from time import time

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import or_
from sqlalchemy.orm import Session

from backend.database import get_db
from backend.models.goal import Goal
from backend.models.task import Task
from backend.models.user import User
from backend.schemas import TaskCreate, TaskResponse, TaskUpdate
from backend.services.auth_service import get_current_user
from backend.services.goal_service import refresh_goal_status_by_id
from backend.services.identity_service import award_task_completion_xp
from backend.services.cache_service import TASKS_CACHE, invalidate_tasks_cache, invalidate_score_cache

router = APIRouter(tags=["tasks"])
TASKS_CACHE_TTL_SECONDS = 60

ARCHIVE_AFTER_HOURS = 24


@router.get("/tasks", response_model=list[TaskResponse])
def get_tasks(
    user_id: int | None = Query(default=None),
    day: date = Query(...),
    category: str | None = Query(default=None),
    priority: str | None = Query(default=None),
    status: str | None = Query(default=None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    target_user_id = user_id or current_user.id
    if target_user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Forbidden")
    
    cache_key = (target_user_id, day, category, priority, status)
    cached = TASKS_CACHE.get(cache_key)
    if cached and (time() - cached.get("timestamp", 0)) < TASKS_CACHE_TTL_SECONDS:
        return cached["payload"]

    cutoff = datetime.utcnow() - timedelta(hours=ARCHIVE_AFTER_HOURS)

    query = db.query(Task).filter(Task.user_id == target_user_id, Task.date == day)
    
    if category:
        query = query.filter(Task.category == category.lower())
    if priority:
        query = query.filter(Task.priority == priority)
    if status:
        query = query.filter(Task.status == status)

    # Exclude completed/failed tasks that were completed more than 24h ago
    query = query.filter(
        or_(
            Task.status == "pending",
            Task.completed_at == None,
            Task.completed_at >= cutoff,
        )
    )

    tasks = query.order_by(Task.created_at.asc()).all()
    
    TASKS_CACHE[cache_key] = {"timestamp": time(), "payload": tasks}
    return tasks


@router.get("/tasks/range", response_model=list[TaskResponse])
def get_tasks_range(
    start_date: date = Query(...),
    end_date: date = Query(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    tasks = db.query(Task).filter(
        Task.user_id == current_user.id,
        Task.date >= start_date,
        Task.date <= end_date
    ).all()
    return tasks

from sqlalchemy import func

@router.get("/tasks/max_daily")
def get_max_daily_tasks(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    # Group by date and count completed tasks
    result = db.query(
        func.count(Task.id).label('task_count')
    ).filter(
        Task.user_id == current_user.id,
        Task.status == "completed"
    ).group_by(Task.date).order_by(func.count(Task.id).desc()).first()
    
    return {"max_tasks_day": result.task_count if result else 0}


@router.post("/tasks", response_model=TaskResponse)
def create_task(payload: TaskCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    target_user_id = payload.user_id or current_user.id
    if target_user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Forbidden")

    if payload.goal_id is not None:
        goal = db.query(Goal).filter(Goal.id == payload.goal_id, Goal.user_id == current_user.id).first()
        if not goal:
            raise HTTPException(status_code=404, detail="Goal not found")

    task = Task(
        user_id=target_user_id,
        goal_id=payload.goal_id,
        habit_id=payload.habit_id,
        title=payload.title,
        description=payload.description,
        category=(payload.category or "general").lower(),
        difficulty=payload.difficulty or "medium",
        priority=payload.priority or "medium",
        recurring=payload.recurring or "none",
        due_date=payload.due_date,
        time=payload.time,
        start_time=payload.start_time,
        status="pending",
        date=payload.date,
    )
    db.add(task)
    db.commit()
    if task.goal_id:
        refresh_goal_status_by_id(db, task.goal_id)
        db.commit()
    db.refresh(task)

    invalidate_tasks_cache(target_user_id)
    invalidate_score_cache(target_user_id)
    if payload.goal_id:
        from backend.services.cache_service import invalidate_goals_cache
        invalidate_goals_cache(target_user_id)
    if payload.habit_id:
        from backend.services.cache_service import invalidate_habits_cache
        invalidate_habits_cache(target_user_id)

    return task


@router.patch("/tasks/{task_id}", response_model=TaskResponse)
def update_task_status(
    task_id: int,
    payload: TaskUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    if task.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Forbidden")

    previous_goal_id = task.goal_id
    previous_status = task.status

    if payload.status:
        if payload.status not in {"completed", "failed", "pending"}:
            raise HTTPException(status_code=400, detail="Invalid task status")
        task.status = payload.status
        # Track completion timestamp for archiving
        if payload.status in {"completed", "failed"} and task.completed_at is None:
            task.completed_at = datetime.utcnow()
        elif payload.status == "pending":
            task.completed_at = None
    
    if payload.priority:
        if payload.priority not in {"low", "medium", "high"}:
            raise HTTPException(status_code=400, detail="Invalid priority")
        task.priority = payload.priority

    if payload.goal_id is not None:
        if payload.goal_id <= 0:
            task.goal_id = None
        else:
            goal = db.query(Goal).filter(Goal.id == payload.goal_id, Goal.user_id == current_user.id).first()
            if not goal:
                raise HTTPException(status_code=404, detail="Goal not found")
            task.goal_id = payload.goal_id

    if task.status == "completed" and previous_status != "completed" and not task.xp_awarded:
        award_task_completion_xp(db, current_user, task)
        task.xp_awarded = True
    elif task.status == "failed" and previous_status != "failed":
        from backend.services.identity_service import penalize_task_failure
        penalize_task_failure(db, current_user, task)

    db.commit()

    if previous_goal_id:
        refresh_goal_status_by_id(db, previous_goal_id)
    if task.goal_id:
        refresh_goal_status_by_id(db, task.goal_id)
    if previous_goal_id or task.goal_id:
        db.commit()

    db.refresh(task)

    invalidate_tasks_cache(current_user.id)
    invalidate_score_cache(current_user.id)
    if previous_goal_id or task.goal_id or task.habit_id:
        from backend.services.cache_service import invalidate_goals_cache, invalidate_habits_cache
        if previous_goal_id or task.goal_id:
            invalidate_goals_cache(current_user.id)
        if task.habit_id:
            invalidate_habits_cache(current_user.id)

    return task
