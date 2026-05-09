import streamlit as st
import base64
import os
from pathlib import Path

@st.cache_data
def get_base64_image(image_name):
    try:
        # Try multiple path variants to be absolutely sure
        paths_to_try = [
            Path(r"c:\Users\my-pc\.vscode\task manager\frontend") / image_name,
            Path(r"c:\Users\my-pc\.vscode\task manager") / image_name,
            Path(__file__).parent.parent / image_name
        ]
        
        for p in paths_to_try:
            if p.exists():
                with open(p, "rb") as img_file:
                    return base64.b64encode(img_file.read()).decode()
        return ""
    except Exception:
        return ""

def hero_metrics(score_value: str, score_label: str,
                  streak_value: str, streak_sub: str,
                  success_value: str, success_sub: str) -> None:
    
    # Image Filenames (using the simplified ones we created)
    filenames = {
        "img1": "ChatGPT_Image_1.png",
        "img2": "ChatGPT_Image_2.png",
        "img3": "ChatGPT_Image_3.png",
        "img4": "ChatGPT_Image_4.png",
        "img5": "ChatGPT_Image_5.png",
        "img6": "ChatGPT_Image_6.png",
        "img7": "ChatGPT_Image_7.png"
    }

    # Load Base64 strings (cached)
    images = {}
    for key, filename in filenames.items():
        images[key] = get_base64_image(filename)

    # Determine status badge position and offsets
    # [Low] [Average]
    # [Good] [Excellent]
    status_pos = "0px 0px" # Default Low
    badge_margin_top = "-25px"
    badge_margin_left = "-20px"
    badge_height = "86px"
    
    label_lower = score_label.lower()
    if label_lower == "average":
        status_pos = "-150px 0px"
        badge_margin_left = "-5px"
    elif label_lower == "good":
        status_pos = "0px -86px"
        badge_margin_top = "10px"
        badge_height = "40px" # Cropped more as requested
    elif label_lower == "excellent":
        status_pos = "-150px -86px"
        badge_margin_left = "0px"
        badge_margin_top = "0px"
        badge_height = "60px"

    def get_bg_style(key, color_fallback):
        if images.get(key):
            # Using 130% size to fully zoom in and eliminate any remaining edge lines or imperfections
            return f"background-image: url('data:image/png;base64,{images[key]}'); background-size: 130% 130%; background-position: center; background-repeat: no-repeat; background-color: transparent !important;"
        return f"background: {color_fallback};"

    # Card 3 Success Value extraction for progress bar
    try:
        success_pct = float(success_value.replace('%', ''))
    except Exception:
        success_pct = 0.0

    st.markdown(
        f"""
        <div class="hero-metric-grid">
            <!-- Card 1: Trust Score -->
            <div class="hero-metric" style="border: none !important; box-shadow: none !important; mix-blend-mode: screen; background-color: transparent !important;">
                <div class="hero-metric-bg" style="{get_bg_style('img2', '#0ea5e9')}"></div>
                <div class="hero-metric-content">
                    <div class="hero-metric-icon" style="background: none !important; border: none !important; mix-blend-mode: screen;">
                        {f'<img src="data:image/png;base64,{images["img1"]}" style="width: 45px; height: 45px; object-fit: contain; mix-blend-mode: screen;">' if images.get("img1") else '🎯'}
                    </div>
                    <div class="hero-metric-label" style="color: white !important; font-weight: 700;">Self Trust Score</div>
                    <div class="hero-metric-value" style="color: white !important;">{score_value}</div>
                    <div class="status-badge-container {label_lower}" style="margin-top: {badge_margin_top}; margin-left: {badge_margin_left}; margin-right: auto; width: 150px; height: {badge_height}; {f"background-image: url('data:image/png;base64,{images['img3']}'); background-size: 320px 185px; background-position: {status_pos};" if images.get('img3') else ''}; mix-blend-mode: screen !important; border-radius: 12px; background-color: transparent !important;">
                    </div>
                </div>
            </div>

            <!-- Card 2: Streak -->
            <div class="hero-metric" style="border: none !important; box-shadow: none !important; mix-blend-mode: screen; background-color: transparent !important;">
                <div class="hero-metric-bg" style="{get_bg_style('img5', '#f97316')}"></div>
                <div class="hero-metric-content">
                    <div class="hero-metric-icon" style="background: none !important; border: none !important; mix-blend-mode: screen;">
                        {f'<img src="data:image/png;base64,{images["img4"]}" style="width: 45px; height: 45px; object-fit: contain; mix-blend-mode: screen;">' if images.get("img4") else '🔥'}
                    </div>
                    <div class="hero-metric-label" style="color: white !important; font-weight: 700;">Current Streak</div>
                    <div class="hero-metric-value" style="color: white !important;">{streak_value}</div>
                </div>
            </div>

            <!-- Card 3: Success -->
            <div class="hero-metric" style="border: none !important; box-shadow: none !important; mix-blend-mode: screen; background-color: transparent !important;">
                <div class="hero-metric-bg" style="{get_bg_style('img7', '#10b981')}"></div>
                <div class="hero-metric-content">
                    <div class="hero-metric-icon" style="background: none !important; border: none !important; mix-blend-mode: screen;">
                        {f'<img src="data:image/png;base64,{images["img6"]}" style="width: 45px; height: 45px; object-fit: contain; mix-blend-mode: screen;">' if images.get("img6") else '✅'}
                    </div>
                    <div class="hero-metric-label" style="color: white !important; font-weight: 700;">Success Rate</div>
                    <div class="hero-metric-value" style="color: white !important;">{success_value}</div>
                    <div style="margin-top: 40px; width: 100%; background: rgba(255,255,255,0.1); height: 8px; border-radius: 10px; overflow: hidden; border: 1px solid rgba(255,255,255,0.2);">
                        <div style="width: {success_pct}%; height: 100%; background: #4ade80; box-shadow: 0 0 10px #4ade80; border-radius: 10px;"></div>
                    </div>
                </div>
            </div>
        </div>
        """,
        unsafe_allow_html=True,
    )


def metric_card(icon: str, title: str, value: str, subtitle: str = "") -> None:
    st.markdown(
        f"""
        <div class='surface-card'>
            <div style='font-size: 1.8rem; margin-bottom: 0.5rem;'>{icon}</div>
            <div style='font-size: 0.85rem; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 0.5rem;'>{title}</div>
            <div style='font-size: 2rem; font-weight: 900; line-height: 1;'>{value}</div>
            {f'<div style=\"font-size: 0.9rem; font-weight: 700; color: #10b981; margin-top: 0.5rem;\">{subtitle}</div>' if subtitle else ''}
        </div>
        """,
        unsafe_allow_html=True,
    )


def modern_progress(label: str, ratio: float, suffix: str = "", tone: str = "auto") -> None:
    clamped = max(0.0, min(1.0, ratio))
    percentage = int(clamped * 100)
    if tone == "auto":
        if clamped >= 0.7:
            tone = "success"
        elif clamped <= 0.3:
            tone = "danger"
        else:
            tone = "neutral"

    if tone == "success":
        gradient = "linear-gradient(90deg, #10b981, #059669)"
    elif tone == "warning":
        gradient = "linear-gradient(90deg, #f59e0b, #d97706)"
    elif tone == "danger":
        gradient = "linear-gradient(90deg, #ef4444, #dc2626)"
    else:
        gradient = "linear-gradient(90deg, #7c3aed, #8b5cf6)"

    st.markdown(
        f"""
        <div class='modern-progress-wrapper'>
            <div class='modern-progress-label'>
                <span>{label}</span>
                <span style='font-weight: 900;'>{percentage}% {suffix}</span>
            </div>
            <div class='modern-progress'>
                <div class='modern-progress-fill' style='width:{percentage}%; background: {gradient};'></div>
            </div>
        </div>
        """,
        unsafe_allow_html=True,
    )


def task_card(task: dict, labels: dict[str, str]) -> None:
    difficulty = task.get("difficulty", "easy")
    status = task.get("status", "pending")
    category_label = labels["category"]
    difficulty_label = labels["difficulty"]
    status_label = labels["status"]
    difficulty_value = labels.get(difficulty, difficulty)
    status_value = labels.get(status, status)
    unknown_title = labels["unknown_title"]
    uncategorized = labels["uncategorized"]
    
    status_icon = {
        "completed": "fa-solid fa-circle-check",
        "failed": "fa-solid fa-circle-xmark",
        "pending": "fa-solid fa-clock"
    }.get(status, "fa-solid fa-circle-question")
    
    status_color = {
        "completed": "#10b981",
        "failed": "#ef4444",
        "pending": "#64748b"
    }.get(status, "#64748b")

    st.markdown(
        f"""
        <div class='surface-card' style='margin-bottom: 1rem;'>
            <div style='display: flex; justify-content: space-between; align-items: flex-start;'>
                <div style='flex: 1;'>
                    <div style='font-size: 1.2rem; font-weight: 800; margin-bottom: 0.75rem; line-height: 1.3;'>{task.get("title", unknown_title)}</div>
                    <div style='display: flex; gap: 0.5rem; flex-wrap: wrap;'>
                        <span class='badge' style='background: rgba(124, 58, 237, 0.1); color: #7c3aed;'>
                            <i class="fa-solid fa-folder-open" style="margin-right: 5px;"></i> {task.get("category", uncategorized)}
                        </span>
                        <span class='badge badge-difficulty-{difficulty}'>
                            <i class="fa-solid fa-bolt" style="margin-right: 5px;"></i> {difficulty_value}
                        </span>
                    </div>
                </div>
                <div style='text-align: right;'>
                    <div style='color: {status_color}; font-weight: 900; font-size: 0.85rem; display: flex; align-items: center; gap: 6px;'>
                        <i class="{status_icon}"></i> {status_value.upper()}
                    </div>
                </div>
            </div>
        </div>
        """,
        unsafe_allow_html=True,
    )


def goal_card(goal: dict) -> None:
    goal_status = goal.get("status", "active")
    pressure_status = goal.get("pressure_status", "on_track")
    goal_type = goal.get("goal_type", "mid_term")
    progress = goal.get("progress_percent", 0) / 100
    days_remaining = goal.get("days_remaining")
    
    pressure_colors = {
        "on_track": {"color": "#7c3aed", "bg": "rgba(124, 58, 237, 0.1)", "label": "On Track"},
        "at_risk": {"color": "#f59e0b", "bg": "rgba(245, 158, 11, 0.1)", "label": "At Risk"},
        "overdue": {"color": "#ef4444", "bg": "rgba(239, 68, 68, 0.1)", "label": "Overdue"}
    }
    
    pressure = pressure_colors.get(pressure_status, pressure_colors["on_track"])
    
    type_labels = {
        "short_term": "Short-term",
        "mid_term": "Mid-term",
        "long_term": "Long-term"
    }
    
    status_icon = {
        "achieved": "fa-solid fa-trophy",
        "failed": "fa-solid fa-circle-xmark",
        "active": "fa-solid fa-bullseye"
    }.get(goal_status, "fa-solid fa-circle")
    
    status_color = {
        "achieved": "#10b981",
        "failed": "#ef4444",
        "active": "#7c3aed"
    }.get(goal_status, "#64748b")
    
    if pressure_status == "overdue":
        progress_tone = "danger"
    elif pressure_status == "at_risk":
        progress_tone = "warning"
    else:
        progress_tone = "auto"
    
    clamped_progress = max(0.0, min(1.0, progress))
    percentage = int(clamped_progress * 100)
    
    if progress_tone == "auto":
        if clamped_progress >= 0.7:
            progress_gradient = "linear-gradient(90deg, #10b981, #059669)"
        elif clamped_progress <= 0.3:
            progress_gradient = "linear-gradient(90deg, #ef4444, #dc2626)"
        else:
            progress_gradient = "linear-gradient(90deg, #f59e0b, #d97706)"
    elif progress_tone == "success":
        progress_gradient = "linear-gradient(90deg, #10b981, #059669)"
    elif progress_tone == "warning":
        progress_gradient = "linear-gradient(90deg, #f59e0b, #d97706)"
    else:
        progress_gradient = "linear-gradient(90deg, #ef4444, #dc2626)"
    
    countdown_html = ""
    if days_remaining is not None:
        countdown_text = f"{days_remaining} day{'s' if days_remaining != 1 else ''} left"
        countdown_html = f"<span style='font-size: 0.85rem; font-weight: 800; color: #64748b;'>{countdown_text}</span>"
    
    linked_count = goal.get("linked_tasks_count", 0)
    completed_count = goal.get("completed_tasks_count", 0)
    
    st.markdown(
        f"""
        <div class='surface-card' style='margin-bottom: 1rem;'>
            <div style='display: flex; justify-content: space-between; align-items: flex-start;'>
                <div style='flex: 1;'>
                    <div style='display: flex; gap: 0.5rem; align-items: center; margin-bottom: 0.75rem; flex-wrap: wrap;'>
                        <span class='badge' style='background: rgba(139, 92, 246, 0.15); color: #8b5cf6;'>
                            <i class='fa-solid fa-tag' style='margin-right: 5px;'></i>{type_labels.get(goal_type, goal_type)}
                        </span>
                        <span class='badge' style='background: {pressure['bg']}; color: {pressure['color']};'>
                            <i class='fa-solid fa-signal' style='margin-right: 5px;'></i>{pressure['label']}
                        </span>
                        <span class='badge' style='background: rgba(124, 58, 237, 0.1); color: #7c3aed;'>
                            <i class='fa-solid fa-folder-open' style='margin-right: 5px;'></i>{goal.get('category', 'general')}
                        </span>
                    </div>
                    <div style='display: flex; align-items: center; gap: 0.75rem; margin-bottom: 1rem;'>
                        <i class='{status_icon}' style='font-size: 1.5rem; color: {status_color};'></i>
                        <h3 style='margin: 0; font-size: 1.3rem; font-weight: 900; line-height: 1.2;'>{goal.get('title', 'Untitled Goal')}</h3>
                    </div>
                    <div style='margin-bottom: 0.75rem;'>
                        <div style='display: flex; justify-content: space-between; margin-bottom: 0.5rem;'>
                            <span style='font-size: 0.85rem; color: #64748b; font-weight: 700;'>Progress</span>
                            <span style='font-size: 0.85rem; font-weight: 900;'>{percentage}% ({completed_count}/{linked_count})</span>
                        </div>
                        <div style='height: 10px; background: rgba(148, 163, 184, 0.2); border-radius: 9999px; overflow: hidden;'>
                            <div style='width: {percentage}%; height: 100%; background: {progress_gradient}; border-radius: 9999px;'></div>
                        </div>
                    </div>
                    <div style='display: flex; justify-content: space-between; align-items: center;'>
                        <span style='font-size: 0.85rem; color: #64748b; font-weight: 600;'>Deadline: {goal.get('deadline', 'N/A')}</span>
                        {countdown_html}
                    </div>
                </div>
            </div>
        </div>
        """,
        unsafe_allow_html=True,
    )
