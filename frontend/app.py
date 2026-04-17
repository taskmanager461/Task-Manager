from __future__ import annotations

import os
from datetime import date
from typing import Any, Callable, TypeVar

import streamlit as st
import streamlit.components.v1 as components

try:
    from frontend.components.api_client import APIClient
    from frontend.components.styles import get_theme_css
    from frontend.components.translations import LANGUAGES, translate
    from frontend.components.ui import metric_card, task_card
except ModuleNotFoundError:
    from components.api_client import APIClient
    from components.styles import get_theme_css
    from components.translations import LANGUAGES, translate
    from components.ui import metric_card, task_card

st.set_page_config(page_title="Task Manager", layout="wide")

MENU = {
    "dashboard": "menu_dashboard",
    "tasks": "menu_tasks",
    "settings": "menu_settings",
}
T = TypeVar("T")

def init_state() -> None:
    # Essential states
    if "api_url" not in st.session_state: st.session_state.api_url = os.getenv("API_BASE_URL", "http://127.0.0.1:8000")
    if "user_id" not in st.session_state: st.session_state.user_id = None
    if "access_token" not in st.session_state: st.session_state.access_token = ""
    if "dark_mode" not in st.session_state: st.session_state.dark_mode = False
    if "lang" not in st.session_state: st.session_state.lang = "en"
    if "menu" not in st.session_state: st.session_state.menu = "dashboard"
    if "username" not in st.session_state: st.session_state.username = ""
    if "name" not in st.session_state: st.session_state.name = ""

    # LocalStorage Bridge
    components.html(
        """
        <script>
        window.parent.addEventListener("message", (e) => {
            if (e.data.type === "set_token") {
                localStorage.setItem("tm_token", e.data.token);
                localStorage.setItem("tm_user", JSON.stringify(e.data.user));
            } else if (e.data.type === "clear_token") {
                localStorage.removeItem("tm_token");
                localStorage.removeItem("tm_user");
            }
        });
        const t = localStorage.getItem("tm_token");
        const u = localStorage.getItem("tm_user");
        if (t && u && !window.parent.location.search.includes("token")) {
            const user = JSON.parse(u);
            const url = new URL(window.parent.location.href);
            url.searchParams.set("token", t);
            url.searchParams.set("user_id", user.user_id);
            url.searchParams.set("username", user.username);
            url.searchParams.set("name", user.name);
            window.parent.location.href = url.href;
        }
        </script>
        """, height=0
    )

    # Auth restore from URL
    params = st.query_params
    if "token" in params and not st.session_state.access_token:
        st.session_state.access_token = params["token"]
        st.session_state.user_id = params["user_id"]
        st.session_state.username = params["username"]
        st.session_state.name = params["name"]
        st.query_params.clear()

def t(key: str, **kwargs: str) -> str:
    return translate(st.session_state.lang, key, **kwargs)

def call_api(func: Callable[..., T], *args: Any, **kwargs: Any) -> tuple[T | None, str | None]:
    try:
        return func(*args, **kwargs), None
    except Exception as e:
        return None, str(e)

def render_sidebar(client: APIClient) -> None:
    with st.sidebar:
        st.title("Task Manager")
        st.session_state.menu = st.radio(t("nav"), options=list(MENU.keys()), 
                                        format_func=lambda x: t(MENU[x]),
                                        index=list(MENU.keys()).index(st.session_state.menu))
        st.divider()
        st.session_state.dark_mode = st.toggle(t("dark_mode"), value=st.session_state.dark_mode)
        st.session_state.lang = st.selectbox(t("language"), options=list(LANGUAGES.keys()), 
                                             format_func=lambda x: LANGUAGES[x],
                                             index=list(LANGUAGES.keys()).index(st.session_state.lang))
        st.divider()
        if st.session_state.user_id:
            st.write(f"👤 {st.session_state.name}")
            if st.button(t("logout"), use_container_width=True):
                st.session_state.user_id = None
                st.session_state.access_token = ""
                components.html("<script>window.parent.postMessage({type: 'clear_token'}, '*');</script>", height=0)
                st.rerun()

def render_auth(client: APIClient) -> None:
    tab1, tab2 = st.tabs([t("welcome_back"), t("create_account")])
    with tab1:
        with st.form("login"):
            u = st.text_input(t("username"))
            p = st.text_input(t("password"), type="password")
            if st.form_submit_button(t("sign_in"), type="primary"):
                res, err = call_api(client.login, u, p)
                if err: st.error(err)
                elif res:
                    st.session_state.user_id, st.session_state.username, st.session_state.name, st.session_state.access_token = res["user_id"], res["username"], res["name"], res["access_token"]
                    components.html(f"<script>window.parent.postMessage({{type: 'set_token', token: '{res['access_token']}', user: {{user_id: {res['user_id']}, username: '{res['username']}', name: '{res['name']}'}}}}, '*');</script>", height=0)
                    st.rerun()
    with tab2:
        with st.form("signup"):
            name = st.text_input(t("full_name"))
            u = st.text_input(t("username"), key="s_u")
            e = st.text_input(t("email"))
            p = st.text_input(t("password"), type="password", key="s_p")
            if st.form_submit_button(t("create_account")):
                res, err = call_api(client.signup, u, e, p, name)
                if err: st.error(err)
                elif res:
                    st.session_state.user_id, st.session_state.username, st.session_state.name, st.session_state.access_token = res["user_id"], res["username"], res["name"], res["access_token"]
                    components.html(f"<script>window.parent.postMessage({{type: 'set_token', token: '{res['access_token']}', user: {{user_id: {res['user_id']}, username: '{res['username']}', name: '{res['name']}'}}}}, '*');</script>", height=0)
                    st.rerun()

def dashboard(client: APIClient, uid: int) -> None:
    st.markdown(f"<div class='main-title'>{t('dashboard')}</div>", unsafe_allow_html=True)
    score, _ = call_api(client.compute_daily_score, uid, date.today())
    if score:
        c1, c2, c3 = st.columns(3)
        with c1: metric_card("🎯", t("self_trust_score"), f"{score['score']:.1f}")
        with c2: metric_card("🔥", t("current_streak"), f"{score['streak']}")
        with c3: metric_card("✅", t("success_rate"), f"{score['success_rate']*100:.0f}%")
    tasks, _ = call_api(client.get_tasks, uid, date.today())
    if tasks:
        st.subheader(t("today_tasks"))
        for tk in tasks: task_card(uid, tk, client)

def tasks_page(client: APIClient, uid: int) -> None:
    st.markdown(f"<div class='main-title'>{t('tasks')}</div>", unsafe_allow_html=True)
    with st.form("add"):
        title = st.text_input(t("task_title"))
        c1, c2 = st.columns(2)
        cat = c1.text_input(t("category"), value="General")
        diff = c2.selectbox(t("difficulty"), ["easy", "medium", "hard"])
        if st.form_submit_button(t("add_task"), type="primary") and title:
            _, err = call_api(client.create_task, uid, title, cat, diff, date.today())
            if not err: st.rerun()
    tasks, _ = call_api(client.get_tasks, uid, date.today())
    if tasks:
        for tk in tasks: task_card(uid, tk, client)

def task_card(uid: int, tk: dict, client: APIClient) -> None:
    with st.container():
        col1, col2, col3 = st.columns([3, 1, 1])
        with col1:
            st.markdown(f"**{tk['title']}** ({tk['category']}) - *{tk['difficulty']}*")
        with col2:
            if tk["status"] == "pending" and st.button("✔", key=f"d_{tk['id']}"):
                client.update_task_status(tk["id"], "completed")
                st.rerun()
        with col3:
            if tk["status"] == "pending" and st.button("❌", key=f"f_{tk['id']}"):
                client.update_task_status(tk["id"], "failed")
                st.rerun()
        if tk["status"] != "pending":
            st.caption(f"Status: {tk['status']}")
        st.divider()

def main() -> None:
    init_state()
    st.markdown(get_theme_css(st.session_state.dark_mode), unsafe_allow_html=True)
    client = APIClient(st.session_state.api_url)
    client.set_token(st.session_state.access_token or None)
    render_sidebar(client)
    if not st.session_state.user_id:
        render_auth(client)
    else:
        uid = int(st.session_state.user_id)
        if st.session_state.menu == "dashboard": dashboard(client, uid)
        elif st.session_state.menu == "tasks": tasks_page(client, uid)
        elif st.session_state.menu == "settings":
            st.markdown(f"<div class='main-title'>{t('settings')}</div>", unsafe_allow_html=True)
            st.write(f"**{t('name')}:** {st.session_state.name}")
            st.write(f"**{t('username')}:** {st.session_state.username}")

if __name__ == "__main__":
    main()
