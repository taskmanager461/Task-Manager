import streamlit as st


def metric_card(icon: str, title: str, value: str, subtitle: str = "") -> None:
    st.markdown(
        f"""
        <div class='surface-card'>
            <div class='metric-label'>{icon} {title}</div>
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
    difficulty_value = labels.get(difficulty, difficulty)
    status_value = labels.get(status, status)
    unknown_title = labels.get("unknown_title", "Unknown")
    uncategorized = labels.get("uncategorized", "General")

    st.markdown(
        f"""
        <div class='surface-card'>
            <div class='task-title'>{task.get("title", unknown_title)}</div>
            <div class='task-meta'>
                <span class='badge'>{task.get("category", uncategorized)}</span>
                <span class='badge'>{difficulty_value}</span>
                <span class='badge'>{status_value.upper()}</span>
            </div>
        </div>
        """,
        unsafe_allow_html=True,
    )
