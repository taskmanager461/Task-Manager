from datetime import datetime, timedelta
from typing import Optional

from fastapi import APIRouter, Depends, Query
from sqlalchemy import desc, or_
from sqlalchemy.orm import Session

from backend.database import get_db
from backend.models.goal import Goal
from backend.models.habit import Habit
from backend.models.task import Task
from backend.models.user import User
from backend.services.auth_service import get_current_user
from backend.services.habit_service import decode_frequency_days

router = APIRouter(tags=["history"])

ARCHIVE_AFTER_HOURS = 24


@router.get("/history")
def get_history(
    page: int = Query(default=1, ge=1),
    limit: int = Query(default=10, ge=1, le=50),
    item_type: Optional[str] = Query(default=None, alias="type"),  # tasks | goals | habits
    search: Optional[str] = Query(default=None),
    sort_by: Optional[str] = Query(default="completed_at"),  # completed_at | date | title
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    cutoff = datetime.utcnow() - timedelta(hours=ARCHIVE_AFTER_HOURS)
    offset = (page - 1) * limit
    items = []

    # ── Tasks ──────────────────────────────────────────────
    if item_type in (None, "tasks"):
        task_q = db.query(Task).filter(
            Task.user_id == current_user.id,
            Task.status.in_(["completed", "failed"]),
            or_(
                Task.completed_at < cutoff,
                Task.completed_at != None,
            ),
        )
        if search:
            task_q = task_q.filter(Task.title.ilike(f"%{search}%"))

        tasks = task_q.all()
        for t in tasks:
            items.append({
                "id": t.id,
                "item_type": "task",
                "title": t.title,
                "category": t.category,
                "status": t.status,
                "priority": t.priority,
                "date": t.date.isoformat() if t.date else None,
                "completed_at": t.completed_at.isoformat() if t.completed_at else None,
                "created_at": t.created_at.isoformat() if t.created_at else None,
                "goal_id": t.goal_id,
                "habit_id": t.habit_id,
            })

    # ── Goals ──────────────────────────────────────────────
    if item_type in (None, "goals"):
        goal_q = db.query(Goal).filter(
            Goal.user_id == current_user.id,
            Goal.status.in_(["achieved", "failed"]),
        )
        if search:
            goal_q = goal_q.filter(Goal.title.ilike(f"%{search}%"))

        goals = goal_q.all()
        for g in goals:
            items.append({
                "id": g.id,
                "item_type": "goal",
                "title": g.title,
                "category": g.category,
                "status": g.status,
                "priority": None,
                "date": g.deadline.isoformat() if g.deadline else None,
                "completed_at": g.completed_at.isoformat() if g.completed_at else None,
                "created_at": g.created_at.isoformat() if g.created_at else None,
                "goal_type": g.goal_type,
            })

    # ── Habits ─────────────────────────────────────────────
    if item_type in (None, "habits"):
        habit_q = db.query(Habit).filter(
            Habit.user_id == current_user.id,
            Habit.is_active.is_(False),
        )
        if search:
            habit_q = habit_q.filter(Habit.title.ilike(f"%{search}%"))

        habits = habit_q.all()
        for h in habits:
            items.append({
                "id": h.id,
                "item_type": "habit",
                "title": h.title,
                "category": h.category,
                "status": "archived",
                "priority": None,
                "date": h.created_at.isoformat() if h.created_at else None,
                "completed_at": h.updated_at.isoformat() if h.updated_at else None,
                "created_at": h.created_at.isoformat() if h.created_at else None,
                "streak": h.streak,
                "best_streak": h.best_streak,
                "frequency_type": h.frequency_type,
                "frequency_days": decode_frequency_days(h.frequency_days),
            })

    # ── Sort ───────────────────────────────────────────────
    def sort_key(x):
        val = x.get(sort_by) or x.get("completed_at") or x.get("created_at") or ""
        return val

    items.sort(key=sort_key, reverse=True)

    total = len(items)
    paginated = items[offset: offset + limit]

    return {
        "total": total,
        "page": page,
        "limit": limit,
        "has_more": (offset + limit) < total,
        "items": paginated,
    }
