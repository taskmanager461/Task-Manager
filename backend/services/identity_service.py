from __future__ import annotations

from datetime import date, timedelta

from sqlalchemy.orm import Session

from backend.models.goal import Goal
from backend.models.task import Task
from backend.models.user import User

TASK_XP_BY_DIFFICULTY = {"easy": 8, "medium": 12, "hard": 18}
TASK_PRIORITY_MULTIPLIER = {"low": 1.0, "medium": 1.1, "high": 1.2}
GOAL_XP_BY_TYPE = {
    "today": 70,
    "tomorrow": 80,
    "three_days": 85,
    "one_week": 95,
    "two_weeks": 105,
    "one_month": 120,
    "three_months": 140,
    "six_months": 155,
    "one_year": 175,
    "one_year_plus": 190,
}

BADGE_DEFINITIONS = [
    {"id": "first_task_completed", "label": "First Task Completed"},
    {"id": "first_goal_completed", "label": "First Goal Completed"},
    {"id": "streak_7", "label": "7 Day Streak"},
    {"id": "goal_crusher", "label": "Goal Crusher"},
]


def xp_required_for_level(level: int) -> int:
    if level <= 1:
        return 0
    required = 0
    for lvl in range(2, level + 1):
        required += 50 * lvl
    return required


def compute_level_from_xp(total_xp: int) -> int:
    level = 1
    while total_xp >= xp_required_for_level(level + 1):
        level += 1
    return level


def _streak_multiplier(streak: int, cap: int = 14, step: float = 0.02) -> float:
    return 1.0 + min(streak, cap) * step


def _trust_anchor(total_xp: int, level: int) -> float:
    anchor = 18.0 + (level * 3.0) + min(42.0, total_xp / 55.0)
    return max(0.0, min(100.0, anchor))


def _trust_gain_from_xp(xp_delta: int, is_goal: bool = False) -> float:
    gain = min(2.5, xp_delta * 0.04)
    if is_goal:
        gain += 1.5
    return gain


def recompute_streak(db: Session, user: User, today: date | None = None) -> int:
    today = today or date.today()
    completed_dates = {
        task_date
        for (task_date,) in db.query(Task.date)
        .filter(Task.user_id == user.id, Task.status == "completed")
        .distinct()
        .all()
    }
    if not completed_dates:
        user.streak = 0
        return 0

    if today not in completed_dates and (today - timedelta(days=1)) not in completed_dates:
        user.streak = 0
        return 0

    cursor = today if today in completed_dates else today - timedelta(days=1)
    streak = 0
    while cursor in completed_dates:
        streak += 1
        cursor -= timedelta(days=1)
    user.streak = streak
    return streak


def change_user_trust_score(db: Session, user: User, base_val: float, is_penalty: bool = False, is_task: bool = False, today_date: date | None = None) -> float:
    if today_date is None:
        today_date = date.today()
    
    current_score = user.trust_score or 0.0
    streak = user.streak or 0
    
    if not is_penalty:
        # 1. Anti-Spam Diminishing Returns for Tasks
        diminishing_factor = 1.0
        if is_task:
            completed_today = db.query(Task).filter(
                Task.user_id == user.id,
                Task.date == today_date,
                Task.status == "completed"
            ).count()
            # Diminishing returns:
            # - First 3 tasks in a day: 100% gain
            # - Tasks 4-6: 50% gain
            # - Tasks 7+: 10% gain
            if completed_today > 6:
                diminishing_factor = 0.1
            elif completed_today > 3:
                diminishing_factor = 0.5
        
        gain = base_val * diminishing_factor
        
        # 2. Streak Multipliers
        # Streaks should act as multipliers (7+ day streak -> slightly stronger positive gains)
        streak_mult = 1.0
        if streak >= 14:
            streak_mult = 1.5
        elif streak >= 7:
            streak_mult = 1.25
        
        gain *= streak_mult
        
        # 3. Recovery System
        # Motivates users to recover, applying recovery bonuses at lower scores
        recovery_mult = 1.0
        if current_score <= 25.0:
            recovery_mult = 1.5      # +50% recovery bonus on low tier
        elif current_score <= 50.0:
            recovery_mult = 1.25     # +25% recovery bonus on average tier
            
        gain *= recovery_mult
        
        # 4. Progression Scaling
        # Trust becomes harder to increase at high levels
        scale_factor = 1.0
        if current_score >= 75.0:
            scale_factor = 0.25      # 75-100 -> difficult progression (25% gain)
        elif current_score >= 50.0:
            scale_factor = 0.5       # 50-75 -> slower progression (50% gain)
            
        gain *= scale_factor
        
        # Apply positive change, capped at max 100
        new_score = min(100.0, current_score + gain)
        user.trust_score = new_score
        return round(gain, 2)
    else:
        # 1. Streak Trust Protection
        # Long streaks act as stronger trust protection for penalties
        protection_factor = 1.0
        if streak >= 14:
            protection_factor = 0.5   # 50% penalty reduction
        elif streak >= 7:
            protection_factor = 0.75  # 25% penalty reduction
            
        penalty = base_val * protection_factor
        
        # Apply negative change, floor at 0
        new_score = max(0.0, current_score + penalty)
        user.trust_score = new_score
        return round(penalty, 2)


def penalize_task_failure(db: Session, user: User, task: Task) -> float:
    # Failed tasks reduce Trust: easy -> -0.3, medium -> -0.6, hard -> -1.0
    penalty = {"easy": -0.3, "medium": -0.6, "hard": -1.0}.get(task.difficulty, -0.6)
    return change_user_trust_score(db, user, penalty, is_penalty=True, today_date=task.date)


def penalize_goal_failure(db: Session, user: User, goal: Goal) -> float:
    # noticeable trust decrease for failed goal (-4.0)
    penalty = -4.0
    return change_user_trust_score(db, user, penalty, is_penalty=True, today_date=goal.completed_at.date() if goal.completed_at else None)


def penalize_goal_abandonment(db: Session, user: User, goal: Goal) -> float:
    # noticeable trust decrease for abandoning an active goal
    penalty = -4.0
    return change_user_trust_score(db, user, penalty, is_penalty=True, today_date=date.today())


def _apply_progression_gain(user: User, xp_delta: int, is_goal: bool) -> dict:
    xp_delta = max(0, xp_delta)
    previous_level = max(1, user.level or 1)
    user.total_xp = max(0, (user.total_xp or 0) + xp_delta)
    user.level = compute_level_from_xp(user.total_xp)
    return {
        "xp_delta": xp_delta,
        "previous_level": previous_level,
        "current_level": user.level,
        "leveled_up": user.level > previous_level,
    }


def award_task_completion_xp(db: Session, user: User, task: Task) -> dict:
    streak = recompute_streak(db, user)
    
    # Redesigned Task XP values: easy -> 5 XP, medium -> 10 XP, hard -> 20 XP
    base_xp = {"easy": 5, "medium": 10, "hard": 20}.get(task.difficulty, 10)
    
    # Streak multipliers for task XP (makes maintaining a streak exciting!)
    streak_mult = 1.0
    if streak >= 100:
        streak_mult = 2.0
    elif streak >= 30:
        streak_mult = 1.6
    elif streak >= 14:
        streak_mult = 1.4
    elif streak >= 7:
        streak_mult = 1.2
        
    # Diminishing returns (Anti-exploit logic to prevent spamming tiny tasks)
    completed_today = db.query(Task).filter(
        Task.user_id == user.id,
        Task.date == task.date,
        Task.status == "completed"
    ).count()
    
    diminishing_factor = 1.0
    if completed_today > 10:
        diminishing_factor = 0.1
    elif completed_today > 5:
        diminishing_factor = 0.5
        
    xp_delta = int(round(base_xp * streak_mult * diminishing_factor))
    
    # Streak Milestone rewards
    if streak == 7:
        xp_delta += 50
    elif streak == 30:
        xp_delta += 200
    elif streak == 100:
        xp_delta += 1000
        
    # Achievement XP
    completed_total = db.query(Task).filter(Task.user_id == user.id, Task.status == "completed").count()
    if completed_total == 1:
        xp_delta += 20  # First task completed bonus XP
    elif completed_total == 100:
        xp_delta += 500 # 100 tasks completed milestone XP
        
    progression = _apply_progression_gain(user, xp_delta=xp_delta, is_goal=False)
    
    # Redesigned Trust Score System task values:
    # easy task -> +0.2, medium -> +0.5, hard -> +0.8
    task_trust_gain = {"easy": 0.2, "medium": 0.5, "hard": 0.8}.get(task.difficulty, 0.5)
    
    # Active goal progress gives small additional trust
    if task.goal_id:
        task_trust_gain += 0.1
        
    trust_delta = change_user_trust_score(db, user, task_trust_gain, is_penalty=False, is_task=True, today_date=task.date)
    progression["trust_delta"] = trust_delta
    return progression


def award_goal_completion_xp(db: Session, user: User, goal: Goal) -> dict:
    streak = recompute_streak(db, user)
    
    # Redesigned Goal XP values (LARGE XP rewards)
    base_xp = {
        "today": 25,
        "tomorrow": 40,
        "three_days": 60,
        "one_week": 100,
        "two_weeks": 150,
        "one_month": 250,
        "three_months": 400,
        "six_months": 600,
        "one_year": 900,
        "one_year_plus": 1200,
    }.get(goal.goal_type, 100)
    
    # Achievement XP: first completed goal
    completed_goals_total = db.query(Goal).filter(Goal.user_id == user.id, Goal.status == "achieved").count()
    if completed_goals_total == 1:
        base_xp += 50  # First completed goal milestone XP reward
        
    xp_delta = base_xp
    progression = _apply_progression_gain(user, xp_delta=xp_delta, is_goal=True)
    
    # Goal completion gives meaningful trust reward (+5.0)
    trust_delta = change_user_trust_score(db, user, 5.0, is_penalty=False, today_date=goal.completed_at.date() if goal.completed_at else None)
    progression["trust_delta"] = trust_delta
    return progression


def apply_habit_impact(db: Session, user: User, status: str, consistency_score: float, habit_streak: int) -> dict:
    if status == "completed":
        # Redesigned Habits system: daily habit complete -> +3 XP
        xp_delta = 3
        
        # 7-day habit streak -> bonus XP (+15 XP); 14-day streak -> bonus XP (+35 XP)
        if habit_streak == 7:
            xp_delta += 15
        elif habit_streak == 14:
            xp_delta += 35
            
        progression = _apply_progression_gain(user, xp_delta=xp_delta, is_goal=False)
        
        # Habits consistency: completed daily habit -> small positive trust gain (+0.2)
        trust_boost = 0.2
        if consistency_score >= 80:
            trust_boost += 0.1
        if habit_streak >= 7:
            trust_boost += 0.1
        if habit_streak >= 14:
            trust_boost += 0.2
            
        trust_delta = change_user_trust_score(db, user, trust_boost, is_penalty=False, today_date=date.today())
        return {
            "xp_delta": progression["xp_delta"],
            "trust_delta": trust_delta,
            "leveled_up": progression["leveled_up"],
        }

    # Repeated missed habits -> gradual trust decline (XP remains unaffected for failure)
    trust_penalty = -0.3
    if consistency_score < 40:
        trust_penalty -= 0.2
        
    trust_delta = change_user_trust_score(db, user, trust_penalty, is_penalty=True, today_date=date.today())
    return {"xp_delta": 0, "trust_delta": trust_delta, "leveled_up": False}


def build_badges(completed_tasks: int, completed_goals: int, streak: int) -> list[dict]:
    unlocked_ids: set[str] = set()
    if completed_tasks >= 1:
        unlocked_ids.add("first_task_completed")
    if completed_goals >= 1:
        unlocked_ids.add("first_goal_completed")
    if streak >= 7:
        unlocked_ids.add("streak_7")
    if completed_goals >= 5:
        unlocked_ids.add("goal_crusher")
    return [
        {"id": badge["id"], "label": badge["label"], "unlocked": badge["id"] in unlocked_ids}
        for badge in BADGE_DEFINITIONS
    ]


def get_identity_profile(db: Session, user: User) -> dict:
    completed_tasks = db.query(Task).filter(Task.user_id == user.id, Task.status == "completed").count()
    completed_goals = db.query(Goal).filter(Goal.user_id == user.id, Goal.status == "achieved").count()

    recompute_streak(db, user)
    computed_level = compute_level_from_xp(user.total_xp or 0)
    if computed_level != user.level:
        user.level = computed_level

    trust_anchor = _trust_anchor(user.total_xp or 0, user.level or 1)
    if (user.trust_score or 0.0) < trust_anchor * 0.2:
        user.trust_score = trust_anchor * 0.2

    current_level = max(1, user.level or 1)
    current_level_floor = xp_required_for_level(current_level)
    next_level = current_level + 1
    next_level_xp = xp_required_for_level(next_level)
    xp_in_level = max(0, (user.total_xp or 0) - current_level_floor)
    level_span = max(1, next_level_xp - current_level_floor)
    progress_percent = round((xp_in_level / level_span) * 100, 1)
    badges = build_badges(completed_tasks, completed_goals, user.streak)

    db.commit()
    return {
        "level": current_level,
        "total_xp": user.total_xp or 0,
        "next_level": next_level,
        "next_level_xp": next_level_xp,
        "xp_into_current_level": xp_in_level,
        "xp_for_next_level": level_span,
        "level_progress_percent": progress_percent,
        "trust_score": round(user.trust_score or 0.0, 2),
        "completed_tasks": completed_tasks,
        "completed_goals": completed_goals,
        "streak": user.streak,
        "badges": badges,
    }
