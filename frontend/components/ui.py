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
