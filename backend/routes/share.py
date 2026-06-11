from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import HTMLResponse
from sqlalchemy.orm import Session
from sqlalchemy import func

from backend.database import get_db
from backend.models.user import User
from backend.models.goal import Goal
from backend.models.task import Task
from backend.models.social import UserSocialProfile

router = APIRouter(tags=["share"])


def _build_level_label(level: int) -> str:
    """Return a rank label for a given level."""
    if level >= 50:
        return "Grandmaster"
    elif level >= 30:
        return "Elite"
    elif level >= 20:
        return "Expert"
    elif level >= 10:
        return "Advanced"
    elif level >= 5:
        return "Intermediate"
    else:
        return "Beginner"


@router.get("/share/{username}", response_class=HTMLResponse)
def public_share_card(username: str, db: Session = Depends(get_db)):
    """Public share page - no auth required. Shows user's progress card."""
    user = db.query(User).filter(User.username == username).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Check if profile is public
    social = db.query(UserSocialProfile).filter(UserSocialProfile.user_id == user.id).first()
    is_public = (social.public_profile if social else True)

    goals_achieved = db.query(Goal).filter(
        Goal.user_id == user.id,
        Goal.status == "achieved"
    ).count()

    completed_tasks = db.query(func.count(Task.id)).filter(
        Task.user_id == user.id,
        Task.status == 'completed'
    ).scalar() or 0

    display_name = user.name or user.username
    avatar_initial = display_name[0].upper() if display_name else "?"
    avatar_url = user.avatar_url or ""

    level = user.level if (not social or social.show_level) else None
    xp = user.total_xp if (not social or social.show_xp) else None
    streak = user.streak if (not social or social.show_streak) else None
    rank_label = _build_level_label(user.level)

    # Format numbers nicely
    def fmt(v):
        if v is None:
            return "—"
        if isinstance(v, int) and v >= 1000:
            return f"{v / 1000:.1f}k"
        return str(v)

    stats_html = ""
    stat_items = [
        ("⚡", "Level", fmt(level)),
        ("✨", "XP", fmt(xp)),
        ("🔥", "Streak", f"{fmt(streak)} days"),
        ("✅", "Tasks Done", fmt(completed_tasks)),
        ("🏆", "Goals", fmt(goals_achieved)),
    ]
    for icon, label, value in stat_items:
        stats_html += f"""
        <div class="stat-box">
            <div class="stat-icon">{icon}</div>
            <div class="stat-value">{value}</div>
            <div class="stat-label">{label}</div>
        </div>"""

    avatar_html = f'<img src="{avatar_url}" alt="{display_name}" class="avatar-img">' if avatar_url else f'<div class="avatar-placeholder">{avatar_initial}</div>'

    html = f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{display_name}'s Progress – Tobedone</title>
  <!-- Open Graph -->
  <meta property="og:type" content="profile">
  <meta property="og:title" content="{display_name}'s Tobedone Progress 🎯">
  <meta property="og:description" content="Level {level or '?'} · {fmt(streak)} day streak · {fmt(goals_achieved)} goals achieved. Check out their progress on Tobedone!">
  <meta property="og:image" content="/assets/og-preview.png?v=2">
  <!-- Twitter -->
  <meta name="twitter:card" content="summary">
  <meta name="twitter:title" content="{display_name}'s Tobedone Progress 🎯">
  <meta name="twitter:description" content="Level {level or '?'} · {fmt(streak)} day streak · {fmt(goals_achieved)} goals achieved.">
  <meta name="twitter:image" content="/assets/og-preview.png?v=2">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800;900&display=swap" rel="stylesheet">
  <style>
    *, *::before, *::after {{ box-sizing: border-box; margin: 0; padding: 0; }}
    body {{
      font-family: 'Inter', sans-serif;
      background: radial-gradient(ellipse at 20% 30%, rgba(10,134,255,0.18) 0%, transparent 55%),
                  radial-gradient(ellipse at 80% 70%, rgba(139,92,246,0.15) 0%, transparent 55%),
                  #060b18;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 2rem 1rem;
      color: #fff;
    }}

    .card {{
      background: linear-gradient(135deg, rgba(20,24,50,0.97) 0%, rgba(10,14,36,0.97) 100%);
      border: 1.5px solid rgba(10,134,255,0.45);
      box-shadow: 0 0 60px rgba(10,134,255,0.18), 0 20px 60px rgba(0,0,0,0.5);
      border-radius: 28px;
      padding: 2.5rem 2rem;
      width: 100%;
      max-width: 420px;
      position: relative;
      overflow: hidden;
      animation: floatIn 0.6s cubic-bezier(0.34,1.56,0.64,1) both;
    }}

    @keyframes floatIn {{
      from {{ opacity: 0; transform: translateY(30px) scale(0.95); }}
      to   {{ opacity: 1; transform: translateY(0) scale(1); }}
    }}

    .card::before {{
      content: '';
      position: absolute;
      inset: 0;
      background: radial-gradient(ellipse at top right, rgba(10,134,255,0.12) 0%, transparent 60%);
      pointer-events: none;
    }}

    .brand {{
      display: flex;
      align-items: center;
      gap: 0.6rem;
      margin-bottom: 1.8rem;
      opacity: 0.7;
    }}
    .brand img {{ width: 28px; height: 28px; border-radius: 8px; }}
    .brand-name {{ font-size: 0.8rem; font-weight: 700; letter-spacing: 0.15em; text-transform: uppercase; color: #94a3b8; }}

    .profile-row {{
      display: flex;
      align-items: center;
      gap: 1.1rem;
      margin-bottom: 2rem;
    }}

    .avatar-img {{
      width: 68px;
      height: 68px;
      border-radius: 50%;
      border: 3px solid rgba(10,134,255,0.7);
      object-fit: cover;
    }}
    .avatar-placeholder {{
      width: 68px;
      height: 68px;
      border-radius: 50%;
      background: linear-gradient(135deg, #0a86ff, #6d28d9);
      border: 3px solid rgba(10,134,255,0.7);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.8rem;
      font-weight: 900;
      color: #fff;
      flex-shrink: 0;
    }}
    .profile-info {{ min-width: 0; }}
    .profile-name {{
      font-size: 1.35rem;
      font-weight: 900;
      letter-spacing: -0.02em;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }}
    .profile-username {{
      font-size: 0.85rem;
      color: #64748b;
      font-weight: 600;
      margin-top: 0.15rem;
    }}
    .profile-rank {{
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
      background: rgba(10,134,255,0.15);
      border: 1px solid rgba(10,134,255,0.35);
      color: #60a5fa;
      font-size: 0.72rem;
      font-weight: 700;
      padding: 0.25rem 0.65rem;
      border-radius: 999px;
      margin-top: 0.4rem;
      letter-spacing: 0.03em;
    }}

    .stats-grid {{
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 0.65rem;
      margin-bottom: 1.8rem;
    }}

    .stat-box {{
      background: rgba(255,255,255,0.04);
      border: 1px solid rgba(255,255,255,0.08);
      border-radius: 16px;
      padding: 0.85rem 0.5rem 0.75rem;
      text-align: center;
      transition: transform 0.2s;
    }}
    .stat-box:hover {{ transform: translateY(-2px); }}
    .stat-icon {{ font-size: 1.1rem; margin-bottom: 0.3rem; }}
    .stat-value {{
      font-size: 1.1rem;
      font-weight: 800;
      color: #e2e8f0;
      line-height: 1;
    }}
    .stat-label {{
      font-size: 0.62rem;
      color: #64748b;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.07em;
      margin-top: 0.25rem;
    }}

    .divider {{
      height: 1px;
      background: linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent);
      margin-bottom: 1.5rem;
    }}

    .cta-section {{
      text-align: center;
    }}
    .cta-text {{
      font-size: 0.82rem;
      color: #64748b;
      margin-bottom: 1rem;
    }}
    .cta-btn {{
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      background: linear-gradient(135deg, #0a86ff, #2563eb);
      color: #fff;
      font-weight: 700;
      font-size: 0.88rem;
      padding: 0.75rem 1.8rem;
      border-radius: 999px;
      text-decoration: none;
      box-shadow: 0 4px 20px rgba(10,134,255,0.4);
      transition: all 0.2s;
      letter-spacing: 0.01em;
    }}
    .cta-btn:hover {{
      transform: translateY(-2px);
      box-shadow: 0 8px 28px rgba(10,134,255,0.55);
    }}

    .footer-note {{
      margin-top: 1.5rem;
      font-size: 0.72rem;
      color: #334155;
      text-align: center;
      letter-spacing: 0.05em;
    }}
  </style>
</head>
<body>
  <div class="card">
    <div class="brand">
      <img src="/assets/logo_auth.png" alt="Tobedone">
      <span class="brand-name">Tobedone</span>
    </div>

    <div class="profile-row">
      {avatar_html}
      <div class="profile-info">
        <div class="profile-name">{display_name}</div>
        <div class="profile-username">@{user.username}</div>
        <div class="profile-rank">⭐ {rank_label}</div>
      </div>
    </div>

    <div class="stats-grid">
      {stats_html}
    </div>

    <div class="divider"></div>

    <div class="cta-section">
      <div class="cta-text">Want to track your own progress?</div>
      <a href="/" class="cta-btn">
        <i class="fas fa-rocket"></i>
        Start using Tobedone
      </a>
    </div>
  </div>

  <div class="footer-note">tobedone · share your journey</div>
</body>
</html>"""

    return HTMLResponse(content=html)
