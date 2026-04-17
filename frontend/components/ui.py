import streamlit as st


def metric_card(icon: str, title: str, value: str, subtitle: str = "") -> None:
    st.markdown(
        f"""
        <div class='surface-card metric-card'>
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
    st.progress(clamped, text=f"{label}: {percentage}% {suffix}")


def task_card(task: dict, labels: dict[str, str]) -> None:
    difficulty = task.get("difficulty", "easy")
    status = task.get("status", "pending")
    
    status_icon = {
        "completed": "✅",
        "failed": "❌",
        "pending": "🕒"
    }.get(status, "❓")
    
    st.markdown(
        f"""
        <div class='surface-card'>
            <div style='display: flex; justify-content: space-between; align-items: center;'>
                <div>
                    <div class='task-title'>{task.get("title", labels.get("unknown_title", "Untitled"))}</div>
                    <div style='font-size: 0.8rem; color: #666;'>
                        {task.get("category", labels.get("uncategorized", "General"))} | {labels.get(difficulty, difficulty)}
                    </div>
                </div>
                <div style='font-size: 1.2rem;'>
                    {status_icon}
                </div>
            </div>
        </div>
        """,
        unsafe_allow_html=True,
    )
