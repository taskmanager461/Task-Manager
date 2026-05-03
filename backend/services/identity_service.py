from __future__ import annotations

from sqlalchemy.orm import Session

from backend.models.goal import Goal
from backend.models.task import Task
from backend.models.user import User


def compute_level(completed_tasks: int, completed_goals: int, streak: int) -> int:
    xp = completed_tasks + (completed_goals * 5) + (streak * 2)
    return max(1, (xp // 25) + 1)


def build_badges(completed_tasks: int, completed_goals: int, streak: int) -> list[dict]:
    return [
        {"id": "first_goal_completed", "label": "First Goal Completed", "unlocked": completed_goals >= 1},
        {"id": "streak_7", "label": "7 Day Streak", "unlocked": streak >= 7},
        {
            "id": "high_performer",
            "label": "High Performer",
            "unlocked": completed_goals >= 3 and completed_tasks >= 25,
        },
    ]


def get_identity_profile(db: Session, user: User) -> dict:
    completed_tasks = db.query(Task).filter(Task.user_id == user.id, Task.status == "completed").count()
    completed_goals = db.query(Goal).filter(Goal.user_id == user.id, Goal.status == "achieved").count()
    level = compute_level(completed_tasks, completed_goals, user.streak)
    badges = build_badges(completed_tasks, completed_goals, user.streak)
    return {
        "level": level,
        "completed_tasks": completed_tasks,
        "completed_goals": completed_goals,
        "streak": user.streak,
        "badges": badges,
    }
