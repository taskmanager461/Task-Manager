from __future__ import annotations


def get_theme_tokens(dark_mode: bool) -> dict[str, str]:
    if dark_mode:
        return {
            "bg": "#0f172a",
            "surface": "#1e293b",
            "surface_soft": "#273449",
            "sidebar": "#111827",
            "text": "#e2e8f0",
            "muted": "#94a3b8",
            "accent": "#38bdf8",
            "accent_2": "#22d3ee",
            "border": "#334155",
            "success": "#22c55e",
            "danger": "#ef4444",
            "shadow": "0 18px 45px rgba(2, 6, 23, 0.42)",
        }

    return {
        "bg": "#f1f5f9",
        "surface": "#ffffff",
        "surface_soft": "#f8fafc",
        "sidebar": "#eef2ff",
        "text": "#0f172a",
        "muted": "#64748b",
        "accent": "#2563eb",
        "accent_2": "#0891b2",
        "border": "#dbeafe",
        "success": "#16a34a",
        "danger": "#dc2626",
        "shadow": "0 14px 35px rgba(15, 23, 42, 0.12)",
    }


def get_theme_css(dark_mode: bool) -> str:
    c = get_theme_tokens(dark_mode)
    return f"""
    <style>
    .stApp {{
        background: {c["bg"]};
        color: {c["text"]};
        font-family: "Inter", "Segoe UI", sans-serif;
    }}
    /* Mobile Optimization & Full Screen */
    @media (max-width: 768px) {{
        .block-container {{
            padding-left: 0.8rem !important;
            padding-right: 0.8rem !important;
            padding-top: 1rem !important;
        }}
        .main-title {{
            font-size: 1.6rem !important;
        }}
        .metric-value {{
            font-size: 1.5rem !important;
        }}
        .surface-card {{
            padding: 0.8rem !important;
        }}
    }}
    .block-container {{
        padding-top: 1.2rem;
        padding-bottom: 1.4rem;
        max-width: 1200px;
    }}
    [data-testid="stSidebar"] {{
        background: {c["sidebar"]};
        border-right: 1px solid {c["border"]};
    }}
    [data-testid="stSidebar"] * {{
        color: {c["text"]};
    }}
    [data-testid="stHeader"] {{
        background: transparent;
    }}
    .main-title {{
        font-size: 2.05rem;
        font-weight: 800;
        margin-bottom: 0.2rem;
        letter-spacing: -0.01em;
    }}
    .main-subtitle {{
        color: {c["muted"]};
        margin-bottom: 1rem;
    }}
    .section-title {{
        font-size: 1.25rem;
        font-weight: 700;
        margin-top: 0.4rem;
        margin-bottom: 0.8rem;
    }}
    .surface-card {{
        background: {c["surface"]};
        border: 1px solid {c["border"]};
        border-radius: 16px;
        padding: 1rem 1rem;
        box-shadow: {c["shadow"]};
        transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
        animation: fadeIn 220ms ease-in-out;
    }}
    .surface-card:hover {{
        transform: translateY(-2px);
        border-color: {c["accent"]};
    }}
    .metric-icon {{
        font-size: 1.2rem;
        opacity: 0.95;
    }}
    .metric-label {{
        font-size: 0.85rem;
        font-weight: 600;
        color: {c["muted"]};
        margin-top: 0.45rem;
        margin-bottom: 0.35rem;
    }}
    .metric-value {{
        font-size: 2rem;
        font-weight: 800;
        line-height: 1.05;
        color: {c["text"]};
        letter-spacing: -0.02em;
    }}
    .metric-sub {{
        font-size: 0.86rem;
        color: {c["muted"]};
        margin-top: 0.25rem;
    }}
    .badge {{
        display: inline-block;
        border-radius: 999px;
        padding: 0.22rem 0.68rem;
        margin-right: 0.42rem;
        margin-top: 0.3rem;
        font-size: 0.72rem;
        font-weight: 700;
        border: 1px solid {c["border"]};
        color: {c["text"]};
        background: {c["surface_soft"]};
    }}
    .badge-difficulty-easy {{
        border-color: rgba(34,197,94,0.45);
        color: {c["success"]};
    }}
    .badge-difficulty-medium {{
        border-color: rgba(56,189,248,0.45);
        color: {c["accent"]};
    }}
    .badge-difficulty-hard {{
        border-color: rgba(239,68,68,0.45);
        color: {c["danger"]};
    }}
    .task-title {{
        font-size: 1.05rem;
        font-weight: 700;
        margin-bottom: 0.45rem;
        color: {c["text"]};
    }}
    .task-status {{
        color: {c["muted"]};
        font-size: 0.85rem;
        margin-top: 0.5rem;
        font-weight: 700;
    }}
    .task-status.status-completed {{
        color: #22c55e;
    }}
    .task-status.status-failed {{
        color: #ef4444;
    }}
    .task-status.status-pending {{
        color: {c["muted"]};
    }}
    .badge-status-completed {{
        border-color: rgba(34, 197, 94, 0.5);
        color: #22c55e;
        background: rgba(34, 197, 94, 0.12);
    }}
    .badge-status-failed {{
        border-color: rgba(239, 68, 68, 0.55);
        color: #ef4444;
        background: rgba(239, 68, 68, 0.12);
    }}
    .badge-status-pending {{
        border-color: rgba(148, 163, 184, 0.5);
        color: {c["muted"]};
        background: rgba(148, 163, 184, 0.12);
    }}
    .modern-progress-wrapper {{
        margin-top: 0.25rem;
        margin-bottom: 0.85rem;
    }}
    .modern-progress-label {{
        font-size: 0.86rem;
        color: {c["muted"]};
        margin-bottom: 0.3rem;
        font-weight: 600;
    }}
    .modern-progress {{
        width: 100%;
        height: 12px;
        border-radius: 999px;
        background: rgba(148, 163, 184, 0.2);
        border: 1px solid {c["border"]};
        overflow: hidden;
    }}
    .modern-progress-fill {{
        height: 100%;
        border-radius: 999px;
        background: linear-gradient(90deg, {c["accent"]}, {c["accent_2"]});
        transition: width 0.5s ease;
    }}
    .stTextInput > div > div > input,
    .stSelectbox > div > div,
    .stDateInput input,
    .stTextInput textarea {{
        background: {c["surface"]} !important;
        color: {c["text"]} !important;
        border: 1px solid {c["border"]} !important;
        border-radius: 10px !important;
    }}
    .stToggle > label,
    .stSelectbox label,
    .stTextInput label,
    .stDateInput label {{
        color: {c["text"]} !important;
    }}
    div[data-testid="stPlotlyChart"] {{
        border: 1px solid {c["border"]};
        border-radius: 14px;
        padding: 0.2rem;
        background: {c["surface"]};
        box-shadow: {c["shadow"]};
    }}
    .table-shell {{
        border-radius: 14px;
        border: 1px solid {c["border"]};
        overflow: hidden;
    }}
    [data-testid="stDataFrame"] {{
        border: 1px solid {c["border"]};
        border-radius: 14px;
        background: {c["surface"]};
    }}
    .stAlert {{
        border-radius: 12px;
    }}
    .stButton > button {{
        border-radius: 10px;
        border: 1px solid {c["border"]};
        background: linear-gradient(135deg, {c["surface"]}, {c["surface_soft"]});
        color: {c["text"]};
        font-weight: 600;
        transition: all 0.2s ease;
    }}
    .stButton > button:hover {{
        border-color: {c["accent"]};
        transform: translateY(-1px);
    }}
    .stButton > button[aria-label*="✔"],
    .stButton > button[aria-label*="Complete"],
    .stButton > button[aria-label*="Ολοκληρωση"],
    .stButton > button[aria-label*="Completar"],
    .stButton > button[aria-label*="Terminer"],
    .stButton > button[aria-label*="Erledigen"],
    .stButton > button[aria-label*="Completare"],
    .stButton > button[aria-label*="Concluir"] {{
        background: linear-gradient(120deg, #22c55e, #16a34a) !important;
        color: #ffffff !important;
        border: none !important;
        box-shadow: 0 4px 12px rgba(34, 197, 94, 0.3);
    }}
    .stButton > button[aria-label*="✔"]:hover,
    .stButton > button[aria-label*="Complete"]:hover,
    .stButton > button[aria-label*="Ολοκληρωση"]:hover,
    .stButton > button[aria-label*="Completar"]:hover,
    .stButton > button[aria-label*="Terminer"]:hover,
    .stButton > button[aria-label*="Erledigen"]:hover,
    .stButton > button[aria-label*="Completare"]:hover,
    .stButton > button[aria-label*="Concluir"]:hover {{
        background: linear-gradient(120deg, #16a34a, #15803d) !important;
        transform: translateY(-2px);
        box-shadow: 0 6px 15px rgba(34, 197, 94, 0.4);
    }}
    .stButton > button[aria-label*="❌"],
    .stButton > button[aria-label*="Fail"],
    .stButton > button[aria-label*="Αποτυχια"],
    .stButton > button[aria-label*="Fallo"],
    .stButton > button[aria-label*="Echec"],
    .stButton > button[aria-label*="Fehler"],
    .stButton > button[aria-label*="Errore"],
    .stButton > button[aria-label*="Falha"] {{
        background: linear-gradient(120deg, #ef4444, #dc2626) !important;
        color: #ffffff !important;
        border: none !important;
        box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
    }}
    .stButton > button[aria-label*="❌"]:hover,
    .stButton > button[aria-label*="Fail"]:hover,
    .stButton > button[aria-label*="Αποτυχια"]:hover,
    .stButton > button[aria-label*="Fallo"]:hover,
    .stButton > button[aria-label*="Echec"]:hover,
    .stButton > button[aria-label*="Fehler"]:hover,
    .stButton > button[aria-label*="Errore"]:hover,
    .stButton > button[aria-label*="Falha"]:hover {{
        background: linear-gradient(120deg, #dc2626, #b91c1c) !important;
        transform: translateY(-2px);
        box-shadow: 0 6px 15px rgba(239, 68, 68, 0.4);
    }}
    .stButton > button:focus {{
        box-shadow: 0 0 0 0.2rem rgba(56, 189, 248, 0.28);
    }}
    .stButton > button[kind="primary"] {{
        background: linear-gradient(120deg, {c["accent"]}, {c["accent_2"]});
        color: #ffffff;
        border: none;
    }}
    .nav-item {{
        border: 1px solid {c["border"]};
        border-radius: 10px;
        padding: 0.45rem 0.65rem;
        margin-bottom: 0.45rem;
        background: {c["surface_soft"]};
        font-size: 0.9rem;
        color: {c["muted"]};
    }}
    .nav-active {{
        background: linear-gradient(120deg, {c["accent"]}, {c["accent_2"]});
        color: #ffffff;
        border-color: transparent;
    }}
    @keyframes fadeIn {{
        from {{ opacity: 0; transform: translateY(4px); }}
        to {{ opacity: 1; transform: translateY(0px); }}
    }}
    </style>
    """
