from __future__ import annotations

import os
from datetime import date, datetime, timedelta
from pathlib import Path
from typing import Any, Callable, TypeVar

import pandas as pd
import plotly.express as px
import plotly.graph_objects as go
import requests
import streamlit as st
import streamlit.components.v1 as components

try:
    from frontend.components.api_client import APIClient
    from frontend.components.styles import get_theme_css, get_theme_tokens
    from frontend.components.translations import LANGUAGES, translate
    from frontend.components.ui import metric_card, modern_progress, task_card
except ModuleNotFoundError:
    from components.api_client import APIClient
    from components.styles import get_theme_css, get_theme_tokens
    from components.translations import LANGUAGES, translate
    from components.ui import metric_card, modern_progress, task_card

# Page Config
st.set_page_config(
    page_title="Task Manager",
    page_icon="🎯",
    layout="wide",
)

T = TypeVar("T")

def init_state() -> None:
    if "api_url" not in st.session_state:
        st.session_state.api_url = os.getenv("API_BASE_URL", "http://127.0.0.1:8000")
    if "user_id" not in st.session_state:
        st.session_state.user_id = None
    if "username" not in st.session_state:
        st.session_state.username = ""
    if "name" not in st.session_state:
        st.session_state.name = ""
    if "access_token" not in st.session_state:
        st.session_state.access_token = ""
    if "dark_mode" not in st.session_state:
        st.session_state.dark_mode = False
    if "lang" not in st.session_state:
        st.session_state.lang = "en"
    if "menu" not in st.session_state:
        st.session_state.menu = "dashboard"
    if "notifications" not in st.session_state:
        st.session_state.notifications = []
    if "loading" not in st.session_state:
        st.session_state.loading = False
    if "action_trigger" not in st.session_state:
        st.session_state.action_trigger = None
    if "action_data" not in st.session_state:
        st.session_state.action_data = {}

    # Auto-login from localStorage on first load
    components.html(
        """
        <script>
        const token = localStorage.getItem("tm_access_token");
        const userStr = localStorage.getItem("tm_user_data");
        const darkMode = localStorage.getItem("tm_dark_mode") === "1";
        
        if (token && userStr && !window.parent.location.search.includes("token")) {
            const user = JSON.parse(userStr);
            const newUrl = new URL(window.parent.location.href);
            newUrl.searchParams.set("token", token);
            newUrl.searchParams.set("user_id", user.user_id);
            newUrl.searchParams.set("username", user.username);
            newUrl.searchParams.set("name", user.name);
            newUrl.searchParams.set("dark_mode", darkMode ? "1" : "0");
            window.parent.location.href = newUrl.href;
        }
        </script>
        """,
        height=0,
    )

    # Sync from query params
    params = st.query_params
    if "token" in params:
        st.session_state.access_token = params["token"]
        st.session_state.user_id = params.get("user_id")
        st.session_state.username = params.get("username", "")
        st.session_state.name = params.get("name", "")
        if "dark_mode" in params:
            st.session_state.dark_mode = params["dark_mode"] == "1"
        st.query_params.clear()

def get_client() -> APIClient:
    client = APIClient(st.session_state.api_url)
    client.set_token(st.session_state.access_token or None)
    return client

def t(key: str, **kwargs: str) -> str:
    return translate(st.session_state["lang"], key, **kwargs)

def safe_error(message: str) -> str:
    return f"{message}"


def call_api(
    func: Callable[..., T],
    *args: Any,
    **kwargs: Any,
) -> tuple[T | None, str | None]:
    try:
        return func(*args, **kwargs), None
    except requests.HTTPError as exc:
        try:
            return None, exc.response.json().get("detail", str(exc))
        except:
            return None, str(exc)
    except Exception as e:
        return None, str(e)


def render_sidebar() -> None:
    with st.sidebar:
        st.title("Menu")
        
        if st.session_state.user_id:
            st.write(f"👤 {st.session_state.name or st.session_state.username}")
            st.divider()
            
            # Simple Navigation
            menu_options = {
                "dashboard": "🏠 Dashboard",
                "tasks": "✅ Tasks",
                "settings": "⚙️ Settings"
            }
            st.session_state.menu = st.radio(
                "Go to",
                options=list(menu_options.keys()),
                format_func=lambda x: menu_options[x],
                index=list(menu_options.keys()).index(st.session_state.menu)
            )
            
            st.divider()
            
            # Theme Toggle
            new_dark = st.toggle("Dark Mode", value=st.session_state.dark_mode)
            if new_dark != st.session_state.dark_mode:
                st.session_state.dark_mode = new_dark
                components.html(
                    f"<script>localStorage.setItem('tm_dark_mode', '{1 if new_dark else 0}');</script>",
                    height=0
                )
                st.rerun()

            st.divider()
            if st.button("Logout", use_container_width=True, disabled=st.session_state.loading):
                st.session_state.action_trigger = "logout"
                st.rerun()
        else:
            st.info("Please login to continue")


def handle_actions(client: APIClient) -> None:
    if not st.session_state.action_trigger:
        return
    
    action = st.session_state.action_trigger
    data = st.session_state.action_data
    
    with st.spinner("Processing..."):
        st.session_state.loading = True
        try:
            if action == "logout":
                st.session_state.user_id = None
                st.session_state.access_token = ""
                components.html(
                    """
                    <script>
                    localStorage.removeItem("tm_access_token");
                    localStorage.removeItem("tm_user_data");
                    window.parent.location.reload();
                    </script>
                    """,
                    height=0
                )
            
            elif action == "login":
                res, err = call_api(client.login, data["username"], data["password"])
                if err:
                    st.error(err)
                elif res:
                    st.session_state.user_id = res["user_id"]
                    st.session_state.username = res["username"]
                    st.session_state.name = res["name"]
                    st.session_state.access_token = res["access_token"]
                    components.html(
                        f"""
                        <script>
                        localStorage.setItem("tm_access_token", "{res['access_token']}");
                        localStorage.setItem("tm_user_data", JSON.stringify({{"user_id": "{res['user_id']}", "username": "{res['username']}", "name": "{res['name']}"}}));
                        </script>
                        """,
                        height=0
                    )
            
            elif action == "signup":
                res, err = call_api(client.signup, data["username"], data["email"], data["password"], data["name"])
                if err:
                    st.error(err)
                elif res:
                    st.session_state.user_id = res["user_id"]
                    st.session_state.username = res["username"]
                    st.session_state.name = res["name"]
                    st.session_state.access_token = res["access_token"]
                    components.html(
                        f"""
                        <script>
                        localStorage.setItem("tm_access_token", "{res['access_token']}");
                        localStorage.setItem("tm_user_data", JSON.stringify({{"user_id": "{res['user_id']}", "username": "{res['username']}", "name": "{res['name']}"}}));
                        </script>
                        """,
                        height=0
                    )

            elif action == "add_task":
                _, err = call_api(client.create_task, st.session_state.user_id, data["title"], data["category"], data["difficulty"], date.today())
                if err:
                    st.error(err)
                else:
                    st.success("Task added!")

            elif action == "update_task":
                _, err = call_api(client.update_task_status, data["task_id"], data["status"])
                if err:
                    st.error(err)

        finally:
            st.session_state.action_trigger = None
            st.session_state.action_data = {}
            st.session_state.loading = False
            st.rerun()


def render_auth(client: APIClient) -> None:
    tab1, tab2 = st.tabs(["Login", "Sign Up"])
    
    with tab1:
        with st.form("login_form"):
            username = st.text_input("Username")
            password = st.text_input("Password", type="password")
            if st.form_submit_button("Login", type="primary", disabled=st.session_state.loading):
                st.session_state.action_trigger = "login"
                st.session_state.action_data = {"username": username, "password": password}
                st.rerun()

    with tab2:
        with st.form("signup_form"):
            name = st.text_input("Full Name")
            username = st.text_input("Username")
            email = st.text_input("Email")
            password = st.text_input("Password", type="password")
            if st.form_submit_button("Sign Up", disabled=st.session_state.loading):
                st.session_state.action_trigger = "signup"
                st.session_state.action_data = {"name": name, "username": username, "email": email, "password": password}
                st.rerun()

def dashboard_page(client: APIClient, user_id: int) -> None:
    st.markdown("<h1 class='main-title'>Dashboard</h1>", unsafe_allow_html=True)
    
    # Load score and tasks
    score, err = call_api(client.compute_daily_score, user_id, date.today())
    if err:
        st.error(f"Error loading score: {err}")
        return
        
    tasks, err = call_api(client.get_tasks, user_id, date.today())
    if err:
        st.error(f"Error loading tasks: {err}")
        return

    # Metrics
    c1, c2, c3 = st.columns(3)
    with c1:
        metric_card("🎯", "Trust Score", f"{score['score']:.1f}")
    with c2:
        metric_card("🔥", "Streak", f"{score['streak']} days")
    with c3:
        metric_card("✅", "Success Rate", f"{score['success_rate']*100:.0f}%")

    # Progress
    completed = sum(1 for t in tasks if t["status"] == "completed")
    total = len(tasks)
    modern_progress("Daily Progress", completed/total if total > 0 else 0)

    # Charts
    st.markdown("<h2 class='section-title'>Analytics</h2>", unsafe_allow_html=True)
    col1, col2 = st.columns(2)
    
    with col1:
        # Score trend
        history, _ = call_api(client.score_history, user_id)
        if history:
            df = pd.DataFrame(history)
            fig = px.line(df, x="date", y="score", title="Score Trend")
            fig.update_layout(
                paper_bgcolor='rgba(0,0,0,0)',
                plot_bgcolor='rgba(0,0,0,0)',
                font_color="#ffffff" if st.session_state.dark_mode else "#000000"
            )
            st.plotly_chart(fig, use_container_width=True)
            
    with col2:
        # Status mix
        if tasks:
            df = pd.DataFrame(tasks)
            fig = px.pie(df, names="status", title="Task Status Mix")
            fig.update_layout(
                paper_bgcolor='rgba(0,0,0,0)',
                plot_bgcolor='rgba(0,0,0,0)',
                font_color="#ffffff" if st.session_state.dark_mode else "#000000"
            )
            st.plotly_chart(fig, use_container_width=True)

def tasks_page(client: APIClient, user_id: int) -> None:
    st.markdown("<h1 class='main-title'>Tasks</h1>", unsafe_allow_html=True)
    
    # Add Task Form
    with st.expander("➕ Add New Task"):
        with st.form("add_task_form"):
            title = st.text_input("Task Title")
            category = st.text_input("Category", value="General")
            difficulty = st.selectbox("Difficulty", ["easy", "medium", "hard"])
            if st.form_submit_button("Add Task", use_container_width=True, disabled=st.session_state.loading):
                if title:
                    st.session_state.action_trigger = "add_task"
                    st.session_state.action_data = {"title": title, "category": category, "difficulty": difficulty}
                    st.rerun()
                else:
                    st.warning("Please enter a title")

    # Task List
    tasks, err = call_api(client.get_tasks, user_id, date.today())
    if err:
        st.error(err)
        return

    if not tasks:
        st.info("No tasks for today. Add one above!")
        return

    for task in tasks:
        with st.container():
            c1, c2, c3 = st.columns([3, 1, 1])
            with c1:
                task_card(task, {"easy": "Easy", "medium": "Medium", "hard": "Hard"})
            with c2:
                if task["status"] == "pending":
                    if st.button("✅ Complete", key=f"comp_{task['id']}", use_container_width=True, disabled=st.session_state.loading):
                        st.session_state.action_trigger = "update_task"
                        st.session_state.action_data = {"task_id": task["id"], "status": "completed"}
                        st.rerun()
            with c3:
                if task["status"] == "pending":
                    if st.button("❌ Fail", key=f"fail_{task['id']}", use_container_width=True, disabled=st.session_state.loading):
                        st.session_state.action_trigger = "update_task"
                        st.session_state.action_data = {"task_id": task["id"], "status": "failed"}
                        st.rerun()

def settings_page() -> None:
    st.markdown("<h1 class='main-title'>Settings</h1>", unsafe_allow_html=True)
    
    st.write("Language")
    new_lang = st.selectbox("Select Language", options=list(LANGUAGES.keys()), 
                          format_func=lambda x: LANGUAGES[x],
                          index=list(LANGUAGES.keys()).index(st.session_state.lang))
    if new_lang != st.session_state.lang:
        st.session_state.lang = new_lang
        st.rerun()

def main() -> None:
    init_state()
    
    # Apply CSS
    st.markdown(get_theme_css(st.session_state.dark_mode), unsafe_allow_html=True)
    
    render_sidebar()
    
    client = get_client()
    handle_actions(client)
    
    if not st.session_state.user_id:
        st.markdown("<h1 class='main-title'>Welcome to Task Manager</h1>", unsafe_allow_html=True)
        render_auth(client)
    else:
        if st.session_state.menu == "dashboard":
            dashboard_page(client, int(st.session_state.user_id))
        elif st.session_state.menu == "tasks":
            tasks_page(client, int(st.session_state.user_id))
        elif st.session_state.menu == "settings":
            settings_page()

if __name__ == "__main__":
    main()
