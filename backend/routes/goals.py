from datetime import date

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from backend.database import get_db
from backend.models.goal import Goal
from backend.models.user import User
from backend.schemas import GoalAnalyticsResponse, GoalCreate, GoalResponse
from backend.services.auth_service import get_current_user
from backend.services.goal_service import compute_goal_task_counts, refresh_goal_status

router = APIRouter(tags=["goals"])


@router.get("/goals", response_model=list[GoalResponse])
def get_goals(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    goals = (
        db.query(Goal)
        .filter(Goal.user_id == current_user.id)
        .order_by(Goal.deadline.asc(), Goal.created_at.desc())
        .all()
    )
    goal_ids = [g.id for g in goals]
    counts_map = compute_goal_task_counts(db, goal_ids)

    changed = False
    response: list[GoalResponse] = []
    for goal in goals:
        counts = counts_map.get(goal.id, {"total": 0, "completed": 0})
        previous_status = goal.status
        refresh_goal_status(goal, counts["total"], counts["completed"])
        if previous_status != goal.status:
            changed = True
        progress = (counts["completed"] / counts["total"] * 100) if counts["total"] > 0 else 0.0
        response.append(
            GoalResponse(
                id=goal.id,
                user_id=goal.user_id,
                title=goal.title,
                category=goal.category,
                deadline=goal.deadline,
                status=goal.status,
                created_at=goal.created_at,
                completed_at=goal.completed_at,
                linked_tasks_count=counts["total"],
                completed_tasks_count=counts["completed"],
                progress_percent=round(progress, 1),
            )
        )
    if changed:
        db.commit()
    return response


@router.post("/goals", response_model=GoalResponse)
def create_goal(
    payload: GoalCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if payload.deadline < date.today():
        raise HTTPException(status_code=400, detail="Deadline cannot be in the past")

    goal = Goal(
        user_id=current_user.id,
        title=payload.title.strip(),
        category=(payload.category or "general").strip().lower(),
        deadline=payload.deadline,
        status="active",
    )
    db.add(goal)
    db.commit()
    db.refresh(goal)
    return GoalResponse(
        id=goal.id,
        user_id=goal.user_id,
        title=goal.title,
        category=goal.category,
        deadline=goal.deadline,
        status=goal.status,
        created_at=goal.created_at,
        completed_at=goal.completed_at,
        linked_tasks_count=0,
        completed_tasks_count=0,
        progress_percent=0.0,
    )


@router.get("/goals/analytics", response_model=GoalAnalyticsResponse)
def goals_analytics(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    goals = db.query(Goal).filter(Goal.user_id == current_user.id).all()
    goal_ids = [g.id for g in goals]
    counts_map = compute_goal_task_counts(db, goal_ids)

    achieved = 0
    failed = 0
    completion_days: list[float] = []
    short_term_days: list[float] = []
    long_term_days: list[float] = []

    for goal in goals:
        counts = counts_map.get(goal.id, {"total": 0, "completed": 0})
        refresh_goal_status(goal, counts["total"], counts["completed"])
        if goal.status == "achieved":
            achieved += 1
            if goal.completed_at:
                days = (goal.completed_at.date() - goal.created_at.date()).days
                completion_days.append(max(0, float(days)))
                target_span = (goal.deadline - goal.created_at.date()).days
                if target_span <= 14:
                    short_term_days.append(max(0, float(days)))
                if target_span >= 30:
                    long_term_days.append(max(0, float(days)))
        elif goal.status == "failed":
            failed += 1

    db.commit()

    total_goals = len(goals)
    completion_rate = (achieved / total_goals * 100) if total_goals > 0 else 0.0
    avg_completion_time = sum(completion_days) / len(completion_days) if completion_days else 0.0

    insights: list[str] = []
    if short_term_days and long_term_days and (sum(short_term_days) / len(short_term_days)) < (sum(long_term_days) / len(long_term_days)):
        insights.append("You complete short-term goals faster")
    if failed > achieved and total_goals >= 3:
        insights.append("You struggle with long-term goals")
    if not insights and total_goals > 0:
        insights.append("Your goal consistency is improving")

    return GoalAnalyticsResponse(
        goal_completion_rate=round(completion_rate, 1),
        goals_achieved=achieved,
        goals_failed=failed,
        average_completion_time_days=round(avg_completion_time, 1),
        insights=insights,
    )
