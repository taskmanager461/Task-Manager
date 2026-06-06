from datetime import date

# Cache stores
TASKS_CACHE = {}
HABITS_CACHE = {}
GOALS_CACHE = {}
DAILY_SCORE_CACHE = {}
WEEKLY_SUMMARY_CACHE = {}
SMART_INSIGHTS_CACHE = {}

def invalidate_tasks_cache(user_id: int):
    """Remove all tasks cache entries for the given user_id."""
    keys_to_remove = [k for k in TASKS_CACHE.keys() if k[0] == user_id]
    for k in keys_to_remove:
        TASKS_CACHE.pop(k, None)

def invalidate_habits_cache(user_id: int):
    """Remove all habits cache entries for the given user_id."""
    keys_to_remove = [k for k in HABITS_CACHE.keys() if k[0] == user_id]
    for k in keys_to_remove:
        HABITS_CACHE.pop(k, None)

def invalidate_goals_cache(user_id: int):
    """Remove goals cache entry for the given user_id."""
    GOALS_CACHE.pop(user_id, None)

def invalidate_score_cache(user_id: int):
    """Remove all score/daily, weekly summary, and smart insights cache entries for the given user_id."""
    keys_to_remove = [k for k in DAILY_SCORE_CACHE.keys() if k[0] == user_id]
    for k in keys_to_remove:
        DAILY_SCORE_CACHE.pop(k, None)
    
    WEEKLY_SUMMARY_CACHE.pop(user_id, None)
    SMART_INSIGHTS_CACHE.pop(user_id, None)

def invalidate_all_user_caches(user_id: int):
    """Invalidate all caches for a specific user."""
    invalidate_tasks_cache(user_id)
    invalidate_habits_cache(user_id)
    invalidate_goals_cache(user_id)
    invalidate_score_cache(user_id)
