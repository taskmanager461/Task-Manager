import streamlit as st


def metric_card(icon: str, title: str, value: str, subtitle: str = "") -> None:
    st.markdown(
        f"""
        <div class='surface-card'>
            <div class='metric-icon'>{icon}</div>
            <div class='metric-label'>{title}</div>
            <div class='metric-value'>{value}</div>
            <div class='metric-sub'>{subtitle}</div>
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
        gradient = "linear-gradient(90deg, #22c55e, #16a34a)"
    elif tone == "warning":
        gradient = "linear-gradient(90deg, #f59e0b, #d97706)"
    elif tone == "danger":
        gradient = "linear-gradient(90deg, #ef4444, #dc2626)"
    else:
        gradient = "linear-gradient(90deg, #94a3b8, #64748b)"

    st.markdown(
        f"""
        <div class='modern-progress-wrapper'>
            <div class='modern-progress-label'>{label}: {percentage}% {suffix}</div>
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
    
    # Status-specific icons and colors
    status_icon = {
        "completed": "fa-solid fa-circle-check",
        "failed": "fa-solid fa-circle-xmark",
        "pending": "fa-solid fa-clock"
    }.get(status, "fa-solid fa-circle-question")
    
    status_color = {
        "completed": "#22c55e",
        "failed": "#ef4444",
        "pending": "#94a3b8"
    }.get(status, "#94a3b8")

    st.markdown(
        f"""
        <div class='surface-card' style='margin-bottom: 1.5rem;'>
            <div style='display: flex; justify-content: space-between; align-items: flex-start;'>
                <div class='task-info'>
                    <div class='task-title'>{task.get("title", unknown_title)}</div>
                    <div class='task-meta'>
                        <span class='badge' style='background: rgba(56, 189, 248, 0.1); color: #0ea5e9;'>
                            <i class="fa-solid fa-folder-open" style="margin-right: 5px;"></i> {task.get("category", uncategorized)}
                        </span>
                        <span class='badge badge-difficulty-{difficulty}'>
                            <i class="fa-solid fa-bolt" style="margin-right: 5px;"></i> {difficulty_value}
                        </span>
                    </div>
                </div>
                <div style='text-align: right;'>
                    <div style='color: {status_color}; font-weight: 800; font-size: 0.9rem; display: flex; align-items: center; gap: 6px;'>
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
    
    # Pressure status colors
    pressure_colors = {
        "on_track": {"color": "#0ea5e9", "bg": "rgba(14, 165, 233, 0.1)", "label": "On Track"},
        "at_risk": {"color": "#f59e0b", "bg": "rgba(245, 158, 11, 0.1)", "label": "At Risk"},
        "overdue": {"color": "#ef4444", "bg": "rgba(239, 68, 68, 0.1)", "label": "Overdue"}
    }
    
    pressure = pressure_colors.get(pressure_status, pressure_colors["on_track"])
    
    # Goal type labels
    type_labels = {
        "short_term": "Short-term",
        "mid_term": "Mid-term",
        "long_term": "Long-term"
    }
    
    # Status icon
    status_icon = {
        "achieved": "fa-solid fa-trophy",
        "failed": "fa-solid fa-circle-xmark",
        "active": "fa-solid fa-bullseye"
    }.get(goal_status, "fa-solid fa-circle")
    
    status_color = {
        "achieved": "#22c55e",
        "failed": "#ef4444",
        "active": "#0ea5e9"
    }.get(goal_status, "#94a3b8")
    
    # Progress tone
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
            progress_gradient = "linear-gradient(90deg, #22c55e, #16a34a)"
        elif clamped_progress <= 0.3:
            progress_gradient = "linear-gradient(90deg, #ef4444, #dc2626)"
        else:
            progress_gradient = "linear-gradient(90deg, #f59e0b, #d97706)"
    elif progress_tone == "success":
        progress_gradient = "linear-gradient(90deg, #22c55e, #16a34a)"
    elif progress_tone == "warning":
        progress_gradient = "linear-gradient(90deg, #f59e0b, #d97706)"
    else:
        progress_gradient = "linear-gradient(90deg, #ef4444, #dc2626)"
    
    countdown_html = ""
    if days_remaining is not None:
        countdown_text = f"{days_remaining} day{'s' if days_remaining != 1 else ''} left"
        countdown_html = f"<div class='countdown-badge'><i class='fa-solid fa-clock' style='margin-right: 5px;'></i>{countdown_text}</div>"
    
    linked_count = goal.get("linked_tasks_count", 0)
    completed_count = goal.get("completed_tasks_count", 0)
    
    st.markdown(
        f"""
        <div class='surface-card' style='margin-bottom: 1.5rem;'>
            <div style='display: flex; justify-content: space-between; align-items: flex-start;'>
                <div style='flex: 1;'>
                    <div style='display: flex; gap: 0.5rem; align-items: center; margin-bottom: 0.5rem;'>
                        <span class='badge' style='background: rgba(139, 92, 246, 0.15); color: #8b5cf6;'>
                            <i class='fa-solid fa-tag' style='margin-right: 5px;'></i>{type_labels.get(goal_type, goal_type)}
                        </span>
                        <span class='badge' style='background: {pressure['bg']}; color: {pressure['color']};'>
                            <i class='fa-solid fa-signal' style='margin-right: 5px;'></i>{pressure['label']}
                        </span>
                        <span class='badge' style='background: rgba(56, 189, 248, 0.1); color: #0ea5e9;'>
                            <i class='fa-solid fa-folder-open' style='margin-right: 5px;'></i>{goal.get('category', 'general')}
                        </span>
                    </div>
                    <div style='display: flex; align-items: center; gap: 0.75rem; margin-bottom: 0.75rem;'>
                        <i class='{status_icon}' style='font-size: 1.5rem; color: {status_color};'></i>
                        <h3 style='margin: 0; font-size: 1.25rem; font-weight: 700;'>{goal.get('title', 'Untitled Goal')}</h3>
                    </div>
                    <div style='margin-bottom: 0.75rem;'>
                        <div style='display: flex; justify-content: space-between; margin-bottom: 0.5rem;'>
                            <span style='font-size: 0.85rem; color: #94a3b8;'>Progress</span>
                            <span style='font-size: 0.85rem; font-weight: 700;'>{percentage}% ({completed_count}/{linked_count})</span>
                        </div>
                        <div style='height: 8px; background: rgba(148, 163, 184, 0.2); border-radius: 9999px; overflow: hidden;'>
                            <div style='width: {percentage}%; height: 100%; background: {progress_gradient}; border-radius: 9999px;'></div>
                        </div>
                    </div>
                    <div style='display: flex; justify-content: space-between; align-items: center;'>
                        <span style='font-size: 0.85rem; color: #64748b;'>Deadline: {goal.get('deadline', 'N/A')}</span>
                        {countdown_html}
                    </div>
                </div>
            </div>
        </div>
        <style>
            .countdown-badge {{
                display: inline-flex;
                align-items: center;
                padding: 0.35rem 0.75rem;
                border-radius: 9999px;
                font-size: 0.85rem;
                font-weight: 700;
                background: {pressure['bg']};
                color: {pressure['color']};
                border: 1px solid {pressure['color']}40;
            }}
        </style>
        """,
        unsafe_allow_html=True,
    )
