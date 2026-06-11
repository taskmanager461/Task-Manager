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


BADGE_DEFINITIONS = [
    # ========================
    # TASK ACHIEVEMENTS
    # ========================
    {"id": "first_step", "label": "First Step", "description": "Complete the first task.", "category": "Tasks", "rarity": "Common", "reward_xp": 25, "target": 1},
    {"id": "productive_day", "label": "Productive Day", "description": "Complete 5 tasks in one day.", "category": "Tasks", "rarity": "Common", "reward_xp": 50, "target": 5},
    {"id": "task_machine", "label": "Task Machine", "description": "Complete 25 tasks.", "category": "Tasks", "rarity": "Rare", "reward_xp": 150, "target": 25},
    {"id": "task_master", "label": "Task Master", "description": "Complete 100 tasks.", "category": "Tasks", "rarity": "Epic", "reward_xp": 500, "target": 100},
    {"id": "completion_expert", "label": "Completion Expert", "description": "Complete 500 tasks.", "category": "Tasks", "rarity": "Epic", "reward_xp": 1500, "target": 500},
    {"id": "perfection_day", "label": "Perfection Day", "description": "Complete every task scheduled for a day.", "category": "Tasks", "rarity": "Rare", "reward_xp": 100, "target": 1},
    {"id": "zero_miss_day", "label": "Zero Miss Day", "description": "Finish a day with no failed tasks.", "category": "Tasks", "rarity": "Common", "reward_xp": 40, "target": 1},

    # ========================
    # GOAL ACHIEVEMENTS
    # ========================
    {"id": "goal_setter", "label": "Goal Setter", "description": "Create the first goal.", "category": "Goals", "rarity": "Common", "reward_xp": 25, "target": 1},
    {"id": "goal_hunter", "label": "Goal Hunter", "description": "Complete the first goal.", "category": "Goals", "rarity": "Common", "reward_xp": 50, "target": 1},
    {"id": "focused", "label": "Focused", "description": "Complete 5 goals.", "category": "Goals", "rarity": "Rare", "reward_xp": 250, "target": 5},
    {"id": "visionary", "label": "Visionary", "description": "Complete 20 goals.", "category": "Goals", "rarity": "Epic", "reward_xp": 1000, "target": 20},
    {"id": "unstoppable", "label": "Unstoppable", "description": "Complete a long-term goal.", "category": "Goals", "rarity": "Epic", "reward_xp": 800, "target": 1},

    # ========================
    # HABIT ACHIEVEMENTS
    # ========================
    {"id": "habit_beginner", "label": "Habit Beginner", "description": "Create the first habit.", "category": "Habits", "rarity": "Common", "reward_xp": 25, "target": 1},
    {"id": "consistent", "label": "Consistent", "description": "Maintain a 7 day habit streak.", "category": "Habits", "rarity": "Common", "reward_xp": 100, "target": 7},
    {"id": "dedicated", "label": "Dedicated", "description": "Maintain a 30 day habit streak.", "category": "Habits", "rarity": "Rare", "reward_xp": 500, "target": 30},
    {"id": "ritual_master", "label": "Ritual Master", "description": "Maintain a 100 day habit streak.", "category": "Habits", "rarity": "Epic", "reward_xp": 2000, "target": 100},
    {"id": "habit_collector", "label": "Habit Collector", "description": "Have 10 active habits.", "category": "Habits", "rarity": "Rare", "reward_xp": 300, "target": 10},

    # ========================
    # STREAK ACHIEVEMENTS
    # ========================
    {"id": "streak_3", "label": "3 Day Streak", "description": "Reach a 3 day streak.", "category": "Streaks", "rarity": "Common", "reward_xp": 30, "target": 3},
    {"id": "streak_7", "label": "7 Day Streak", "description": "Reach a 7 day streak.", "category": "Streaks", "rarity": "Common", "reward_xp": 70, "target": 7},
    {"id": "streak_14", "label": "14 Day Streak", "description": "Reach a 14 day streak.", "category": "Streaks", "rarity": "Rare", "reward_xp": 150, "target": 14},
    {"id": "streak_30", "label": "30 Day Streak", "description": "Reach a 30 day streak.", "category": "Streaks", "rarity": "Rare", "reward_xp": 400, "target": 30},
    {"id": "streak_50", "label": "50 Day Streak", "description": "Reach a 50 day streak.", "category": "Streaks", "rarity": "Epic", "reward_xp": 800, "target": 50},
    {"id": "streak_100", "label": "100 Day Streak", "description": "Reach a 100 day streak.", "category": "Streaks", "rarity": "Legendary", "reward_xp": 2000, "target": 100},
    {"id": "comeback_king", "label": "Comeback King", "description": "Recover after losing a streak.", "category": "Streaks", "rarity": "Rare", "reward_xp": 200, "target": 1},

    # ========================
    # TRUST SCORE ACHIEVEMENTS
    # ========================
    {"id": "average_citizen", "label": "Average Citizen", "description": "Reach Trust 26.", "category": "Trust", "rarity": "Common", "reward_xp": 50, "target": 26},
    {"id": "reliable", "label": "Reliable", "description": "Reach Trust 51.", "category": "Trust", "rarity": "Rare", "reward_xp": 150, "target": 51},
    {"id": "excellent", "label": "Excellent", "description": "Reach Trust 76.", "category": "Trust", "rarity": "Epic", "reward_xp": 400, "target": 76},
    {"id": "trusted", "label": "Trusted", "description": "Maintain Trust 75+ for 30 days.", "category": "Trust", "rarity": "Epic", "reward_xp": 1000, "target": 30},
    {"id": "iron_discipline", "label": "Iron Discipline", "description": "Maintain Trust 90+ for 30 days.", "category": "Trust", "rarity": "Epic", "reward_xp": 2000, "target": 30},
    {"id": "elite_consistency", "label": "Elite Consistency", "description": "Reach Trust 100.", "category": "Trust", "rarity": "Legendary", "reward_xp": 5000, "target": 100},

    # ========================
    # XP ACHIEVEMENTS
    # ========================
    {"id": "level_5", "label": "Level 5", "description": "Reach Level 5.", "category": "XP", "rarity": "Common", "reward_xp": 50, "target": 5},
    {"id": "level_10", "label": "Level 10", "description": "Reach Level 10.", "category": "XP", "rarity": "Rare", "reward_xp": 200, "target": 10},
    {"id": "level_25", "label": "Level 25", "description": "Reach Level 25.", "category": "XP", "rarity": "Rare", "reward_xp": 500, "target": 25},
    {"id": "level_50", "label": "Level 50", "description": "Reach Level 50.", "category": "XP", "rarity": "Epic", "reward_xp": 1500, "target": 50},
    {"id": "level_100", "label": "Level 100", "description": "Reach Level 100.", "category": "XP", "rarity": "Legendary", "reward_xp": 5000, "target": 100},
    {"id": "veteran", "label": "Veteran", "description": "Earn 10000 total XP.", "category": "XP", "rarity": "Epic", "reward_xp": 1000, "target": 10000},

    # ========================
    # CALENDAR ACHIEVEMENTS
    # ========================
    {"id": "active_week", "label": "Active Week", "description": "Use the app for 7 consecutive days.", "category": "Calendar", "rarity": "Common", "reward_xp": 100, "target": 7},
    {"id": "active_month", "label": "Active Month", "description": "Use the app for 30 consecutive days.", "category": "Calendar", "rarity": "Rare", "reward_xp": 500, "target": 30},
    {"id": "weekend_warrior", "label": "Weekend Warrior", "description": "Complete tasks during both Saturday and Sunday.", "category": "Calendar", "rarity": "Common", "reward_xp": 50, "target": 2},
    {"id": "perfect_week", "label": "Perfect Week", "description": "Complete a week with no failed tasks.", "category": "Calendar", "rarity": "Rare", "reward_xp": 250, "target": 7},

    # ========================
    # RARE ACHIEVEMENTS
    # ========================
    {"id": "night_owl", "label": "Night Owl", "description": "Complete 50 tasks after 23:00.", "category": "Rare", "rarity": "Rare", "reward_xp": 500, "target": 50},
    {"id": "early_bird", "label": "Early Bird", "description": "Complete 50 tasks before 08:00.", "category": "Rare", "rarity": "Rare", "reward_xp": 500, "target": 50},
    {"id": "recovery_mode", "label": "Recovery Mode", "description": "Raise Trust from below 25 to above 50.", "category": "Rare", "rarity": "Epic", "reward_xp": 600, "target": 1},
    {"id": "redemption_arc", "label": "Redemption Arc", "description": "Raise Trust from below 25 to above 75.", "category": "Rare", "rarity": "Epic", "reward_xp": 1200, "target": 1},
    {"id": "marathon", "label": "Marathon", "description": "Complete 1000 tasks.", "category": "Rare", "rarity": "Epic", "reward_xp": 3000, "target": 1000},
    {"id": "one_year_strong", "label": "One Year Strong", "description": "Remain active for 365 days.", "category": "Rare", "rarity": "Epic", "reward_xp": 5000, "target": 365},

    # ========================
    # LEGENDARY ACHIEVEMENTS
    # ========================
    {"id": "century_streak", "label": "Century Streak", "description": "Reach a 100 day streak.", "category": "Legendary", "rarity": "Legendary", "reward_xp": 2500, "target": 100},
    {"id": "goal_legend", "label": "Goal Legend", "description": "Complete 100 goals.", "category": "Legendary", "rarity": "Legendary", "reward_xp": 5000, "target": 100},
    {"id": "habit_legend", "label": "Habit Legend", "description": "Reach a 365 day habit streak.", "category": "Legendary", "rarity": "Legendary", "reward_xp": 5000, "target": 365},
    {"id": "tobedone_legend", "label": "Tobedone Legend", "description": "Unlock 80% of all achievements.", "category": "Legendary", "rarity": "Legendary", "reward_xp": 10000, "target": 38}  # 80% of 47 is ~38
]

def build_badges_complete(db: Session, user: User) -> list[dict]:
    from sqlalchemy import func
    from backend.models.daily_score import DailyScore
    from backend.models.habit import Habit
    from backend.models.habit_log import HabitLog

    # Gather data metrics
    # Tasks metrics
    all_user_tasks = db.query(Task).filter(Task.user_id == user.id).all()
    completed_tasks = sum(1 for t in all_user_tasks if t.status == "completed")
    
    # Check night owl / early bird tasks
    tasks_night_owl = 0
    tasks_early_bird = 0
    for t in all_user_tasks:
        if t.status == "completed" and t.time:
            try:
                hour = int(t.time.split(":")[0])
                if hour >= 23 or hour < 4:
                    tasks_night_owl += 1
                if hour >= 4 and hour < 8:
                    tasks_early_bird += 1
            except Exception:
                pass

    # Find daily task execution stats
    tasks_by_date = {}
    failed_by_date = {}
    for t in all_user_tasks:
        tasks_by_date.setdefault(t.date, []).append(t)
        if t.status == "failed":
            failed_by_date[t.date] = failed_by_date.get(t.date, 0) + 1

    completed_all_scheduled_days = 0
    zero_miss_days = 0
    for dt, tlist in tasks_by_date.items():
        if all(t.status == "completed" for t in tlist):
            completed_all_scheduled_days += 1
        if not any(t.status == "failed" for t in tlist):
            zero_miss_days += 1

    # Goals metrics
    all_goals = db.query(Goal).filter(Goal.user_id == user.id).all()
    created_goals_count = len(all_goals)
    completed_goals = sum(1 for g in all_goals if g.status == "achieved")
    long_term_goals_completed = sum(1 for g in all_goals if g.status == "achieved" and g.goal_type in ["six_months", "one_year", "one_year_plus"])

    # Habits metrics
    active_habits = db.query(Habit).filter(Habit.user_id == user.id, Habit.is_active.is_(True)).all()
    active_habits_count = len(active_habits)
    created_habits_count = db.query(Habit).filter(Habit.user_id == user.id).count()
    
    # Best habit streak
    best_habit_streak = 0
    if active_habits:
        best_habit_streak = max(h.best_streak or 0 for h in active_habits)
    
    # Streaks metrics
    user_streak = user.streak or 0
    
    # Streak recoveries (Comeback King)
    # Check if user had a streak, drop to 0, and then had active completions again
    streak_history = db.query(DailyScore).filter(DailyScore.user_id == user.id).order_by(DailyScore.date.asc()).all()
    # If they recovered from 0 to at least 1 in their logs history
    recovered_streak = 0
    had_zero = False
    for r in streak_history:
        # We can infer recovery if streak dropped to 0 and rose again, or just query logs
        pass
    # Simple fallback: if user has streak > 0 and had tasks failed/missed in the past, or daily scores count > 5
    if user_streak > 0 and len(streak_history) > 3:
        recovered_streak = 1

    # Trust Score metrics
    trust_score = user.trust_score or 0.0
    
    # Trusted for 30 days (Trust 75+ for 30 consecutive daily scores)
    trust_75_days = 0
    trust_90_days = 0
    current_75_run = 0
    current_90_run = 0
    
    # Recovery Mode / Redemption Arc checks
    had_below_25 = False
    recovery_mode_unlocked = 0
    redemption_arc_unlocked = 0
    
    for r in streak_history:
        score_val = r.score or 0.0
        if score_val < 25.0:
            had_below_25 = True
        if had_below_25 and score_val >= 50.0:
            recovery_mode_unlocked = 1
        if had_below_25 and score_val >= 75.0:
            redemption_arc_unlocked = 1

        if score_val >= 75.0:
            current_75_run += 1
            trust_75_days = max(trust_75_days, current_75_run)
        else:
            current_75_run = 0
            
        if score_val >= 90.0:
            current_90_run += 1
            trust_90_days = max(trust_90_days, current_90_run)
        else:
            current_90_run = 0

    # XP & Level metrics
    user_level = user.level or 1
    total_xp = user.total_xp or 0

    # Calendar consecutive days usage
    # Distinct dates with any tasks, goal completions, habit logs or daily score records
    active_dates = {r.date for r in streak_history}
    for t in all_user_tasks:
        active_dates.add(t.date)
    
    consecutive_active_days = 0
    max_consecutive_active_days = 0
    if active_dates:
        sorted_dates = sorted(list(active_dates))
        curr_run = 1
        for i in range(1, len(sorted_dates)):
            if (sorted_dates[i] - sorted_dates[i-1]).days == 1:
                curr_run += 1
            elif (sorted_dates[i] - sorted_dates[i-1]).days > 1:
                max_consecutive_active_days = max(max_consecutive_active_days, curr_run)
                curr_run = 1
        max_consecutive_active_days = max(max_consecutive_active_days, curr_run)

    # Weekend Warrior (Task completed on Saturday AND Sunday of same week)
    completed_saturdays = set()
    completed_sundays = set()
    for t in all_user_tasks:
        if t.status == "completed":
            isocal = t.date.isocalendar() # year, week, weekday
            if isocal[2] == 6: # Saturday
                completed_saturdays.add((isocal[0], isocal[1]))
            elif isocal[2] == 7: # Sunday
                completed_sundays.add((isocal[0], isocal[1]))
    
    weekend_warrior_count = len(completed_saturdays.intersection(completed_sundays))

    # Perfect week: 7 consecutive days with no failed tasks
    perfect_weeks = 0
    # Group tasks by ISO calendar week
    weeks_tasks = {}
    for t in all_user_tasks:
        isocal = t.date.isocalendar()
        weeks_tasks.setdefault((isocal[0], isocal[1]), []).append(t)
    for wk, tlist in weeks_tasks.items():
        if len(tlist) >= 3 and all(t.status != "failed" for t in tlist):
            perfect_weeks += 1

    # Map each badge progress dynamically
    badges_unlocked_count = 0
    badge_list = []
    
    # Calculate global unlock rates across the database
    total_users_in_db = max(1, db.query(User).count())

    for b in BADGE_DEFINITIONS:
        bid = b["id"]
        progress_val = 0
        is_unlocked = False
        
        if bid == "first_step":
            progress_val = completed_tasks
            is_unlocked = completed_tasks >= 1
        elif bid == "productive_day":
            # Max tasks completed in a single day
            daily_completed = {}
            for t in all_user_tasks:
                if t.status == "completed":
                    daily_completed[t.date] = daily_completed.get(t.date, 0) + 1
            progress_val = max(daily_completed.values()) if daily_completed else 0
            is_unlocked = progress_val >= 5
        elif bid == "task_machine":
            progress_val = completed_tasks
            is_unlocked = completed_tasks >= 25
        elif bid == "task_master":
            progress_val = completed_tasks
            is_unlocked = completed_tasks >= 100
        elif bid == "completion_expert":
            progress_val = completed_tasks
            is_unlocked = completed_tasks >= 500
        elif bid == "perfection_day":
            progress_val = completed_all_scheduled_days
            is_unlocked = completed_all_scheduled_days >= 1
        elif bid == "zero_miss_day":
            progress_val = zero_miss_days
            is_unlocked = zero_miss_days >= 1
            
        elif bid == "goal_setter":
            progress_val = created_goals_count
            is_unlocked = created_goals_count >= 1
        elif bid == "goal_hunter":
            progress_val = completed_goals
            is_unlocked = completed_goals >= 1
        elif bid == "focused":
            progress_val = completed_goals
            is_unlocked = completed_goals >= 5
        elif bid == "visionary":
            progress_val = completed_goals
            is_unlocked = completed_goals >= 20
        elif bid == "unstoppable":
            progress_val = long_term_goals_completed
            is_unlocked = long_term_goals_completed >= 1
            
        elif bid == "habit_beginner":
            progress_val = created_habits_count
            is_unlocked = created_habits_count >= 1
        elif bid == "consistent":
            progress_val = best_habit_streak
            is_unlocked = best_habit_streak >= 7
        elif bid == "dedicated":
            progress_val = best_habit_streak
            is_unlocked = best_habit_streak >= 30
        elif bid == "ritual_master":
            progress_val = best_habit_streak
            is_unlocked = best_habit_streak >= 100
        elif bid == "habit_collector":
            progress_val = active_habits_count
            is_unlocked = active_habits_count >= 10
            
        elif bid == "streak_3":
            progress_val = user_streak
            is_unlocked = user_streak >= 3
        elif bid == "streak_7":
            progress_val = user_streak
            is_unlocked = user_streak >= 7
        elif bid == "streak_14":
            progress_val = user_streak
            is_unlocked = user_streak >= 14
        elif bid == "streak_30":
            progress_val = user_streak
            is_unlocked = user_streak >= 30
        elif bid == "streak_50":
            progress_val = user_streak
            is_unlocked = user_streak >= 50
        elif bid == "streak_100" or bid == "century_streak":
            progress_val = user_streak
            is_unlocked = user_streak >= 100
        elif bid == "comeback_king":
            progress_val = recovered_streak
            is_unlocked = recovered_streak >= 1
            
        elif bid == "average_citizen":
            progress_val = int(trust_score)
            is_unlocked = trust_score >= 26
        elif bid == "reliable":
            progress_val = int(trust_score)
            is_unlocked = trust_score >= 51
        elif bid == "excellent":
            progress_val = int(trust_score)
            is_unlocked = trust_score >= 76
        elif bid == "trusted":
            progress_val = trust_75_days
            is_unlocked = trust_75_days >= 30
        elif bid == "iron_discipline":
            progress_val = trust_90_days
            is_unlocked = trust_90_days >= 30
        elif bid == "elite_consistency":
            progress_val = int(trust_score)
            is_unlocked = trust_score >= 100
            
        elif bid == "level_5":
            progress_val = user_level
            is_unlocked = user_level >= 5
        elif bid == "level_10":
            progress_val = user_level
            is_unlocked = user_level >= 10
        elif bid == "level_25":
            progress_val = user_level
            is_unlocked = user_level >= 25
        elif bid == "level_50":
            progress_val = user_level
            is_unlocked = user_level >= 50
        elif bid == "level_100":
            progress_val = user_level
            is_unlocked = user_level >= 100
        elif bid == "veteran":
            progress_val = total_xp
            is_unlocked = total_xp >= 10000
            
        elif bid == "active_week":
            progress_val = max_consecutive_active_days
            is_unlocked = max_consecutive_active_days >= 7
        elif bid == "active_month":
            progress_val = max_consecutive_active_days
            is_unlocked = max_consecutive_active_days >= 30
        elif bid == "weekend_warrior":
            progress_val = weekend_warrior_count
            is_unlocked = weekend_warrior_count >= 1
        elif bid == "perfect_week":
            progress_val = perfect_weeks
            is_unlocked = perfect_weeks >= 1
            
        elif bid == "night_owl":
            progress_val = tasks_night_owl
            is_unlocked = tasks_night_owl >= 50
        elif bid == "early_bird":
            progress_val = tasks_early_bird
            is_unlocked = tasks_early_bird >= 50
        elif bid == "recovery_mode":
            progress_val = recovery_mode_unlocked
            is_unlocked = recovery_mode_unlocked >= 1
        elif bid == "redemption_arc":
            progress_val = redemption_arc_unlocked
            is_unlocked = redemption_arc_unlocked >= 1
        elif bid == "marathon":
            progress_val = completed_tasks
            is_unlocked = completed_tasks >= 1000
        elif bid == "one_year_strong" or bid == "habit_legend":
            # For 365 habits/active days, check active log span
            progress_val = max_consecutive_active_days
            is_unlocked = max_consecutive_active_days >= 365
            
        elif bid == "goal_legend":
            progress_val = completed_goals
            is_unlocked = completed_goals >= 100
            
        # Bound current progress representation to target limit
        bound_current = min(b["target"], progress_val)
        
        if is_unlocked:
            badges_unlocked_count += 1
            
        badge_list.append({
            "id": bid,
            "label": b["label"],
            "description": b["description"],
            "category": b["category"],
            "rarity": b["rarity"],
            "reward_xp": b["reward_xp"],
            "unlocked": is_unlocked,
            "progress_current": bound_current,
            "progress_target": b["target"],
            "unlock_date": date.today().isoformat() if is_unlocked else None,
            "completion_percentage": round((1.0 / total_users_in_db) * 100, 1) # simple dynamic representation
        })
        
    # Handle the final badge: Tobedone Legend (80% of all achievements)
    legend_badge = next((x for x in badge_list if x["id"] == "tobedone_legend"), None)
    if legend_badge:
        # Subtract the legend badge itself from total possible to avoid circular check
        other_unlocked = sum(1 for x in badge_list if x["unlocked"] and x["id"] != "tobedone_legend")
        legend_badge["progress_current"] = other_unlocked
        legend_badge["unlocked"] = other_unlocked >= 38
        if legend_badge["unlocked"]:
            legend_badge["unlock_date"] = date.today().isoformat()

    return badge_list


def build_badges(completed_tasks: int, completed_goals: int, streak: int) -> list[dict]:
    # Legacy wrapper compatibility
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

    current_level = max(1, user.level or 1)
    current_level_floor = xp_required_for_level(current_level)
    next_level = current_level + 1
    next_level_xp = xp_required_for_level(next_level)
    xp_in_level = max(0, (user.total_xp or 0) - current_level_floor)
    level_span = max(1, next_level_xp - current_level_floor)
    progress_percent = round((xp_in_level / level_span) * 100, 1)
    
    # Retrieve complete comprehensive list of new achievements
    badges = build_badges_complete(db, user)

    # Compute additional task completion statistics
    today_val = date.today()
    completed_tasks_today = db.query(Task).filter(Task.user_id == user.id, Task.status == "completed", Task.date == today_val).count()
    completed_tasks_this_week = db.query(Task).filter(Task.user_id == user.id, Task.status == "completed", Task.date >= today_val - timedelta(days=6)).count()
    completed_tasks_this_month = db.query(Task).filter(Task.user_id == user.id, Task.status == "completed", Task.date >= today_val - timedelta(days=29)).count()

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
        "completed_tasks_today": completed_tasks_today,
        "completed_tasks_this_week": completed_tasks_this_week,
        "completed_tasks_this_month": completed_tasks_this_month,
    }

