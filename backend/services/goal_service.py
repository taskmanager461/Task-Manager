from __future__ import annotations

from datetime import date, datetime

from sqlalchemy import case, func
from sqlalchemy.orm import Session

from backend.models.goal import Goal
from backend.models.task import Task


def compute_goal_task_counts(db: Session, goal_ids: list[int]) -> dict[int, dict[str, int]]:
    if not goal_ids:
        return {}

    rows = (
        db.query(
            Task.goal_id,
            func.count(Task.id).label("total"),
            func.sum(case((Task.status == "completed", 1), else_=0)).label("completed"),
        )
        .filter(Task.goal_id.in_(goal_ids))
        .group_by(Task.goal_id)
        .all()
    )

    result: dict[int, dict[str, int]] = {}
    for goal_id, total, completed in rows:
        result[int(goal_id)] = {"total": int(total or 0), "completed": int(completed or 0)}
    return result


def refresh_goal_status(goal: Goal, total_tasks: int, completed_tasks: int) -> None:
    today = date.today()
    achieved = total_tasks > 0 and completed_tasks >= total_tasks

    if achieved:
        goal.status = "achieved"
        if goal.completed_at is None:
            goal.completed_at = datetime.utcnow()
        return

    if goal.deadline < today:
        goal.status = "failed"
        goal.completed_at = None
        return

    goal.status = "active"
    goal.completed_at = None


def refresh_goal_status_by_id(db: Session, goal_id: int) -> None:
    goal = db.query(Goal).filter(Goal.id == goal_id).first()
    if not goal:
        return
    counts = compute_goal_task_counts(db, [goal.id]).get(goal.id, {"total": 0, "completed": 0})
    refresh_goal_status(goal, counts["total"], counts["completed"])
