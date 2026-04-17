from __future__ import annotations


def get_theme_tokens(dark_mode: bool) -> dict[str, str]:
    if dark_mode:
        return {
            "background": "#0f172a",
            "text": "#ffffff",
            "primary": "#3b82f6",
            "surface": "#1e293b",
            "border": "#334155",
            "muted": "#94a3b8",
        }
    return {
        "background": "#ffffff",
        "text": "#000000",
        "primary": "#2563eb",
        "surface": "#f8fafc",
        "border": "#e2e8f0",
        "muted": "#64748b",
    }


def get_theme_css(dark_mode: bool) -> str:
    c = get_theme_tokens(dark_mode)
    return f"""
    <style>
    /* Reset Streamlit defaults */
    #MainMenu {{visibility: hidden;}}
    header {{visibility: hidden;}}
    footer {{visibility: hidden;}}
    
    .stApp {{
        background-color: {c["background"]};
        color: {c["text"]};
    }}
    
    /* Sidebar styling */
    section[data-testid="stSidebar"] {{
        background-color: {c["surface"]} !important;
    }}
    section[data-testid="stSidebar"] * {{
        color: {c["text"]} !important;
    }}
    
    /* Surface cards */
    .surface-card {{
        background-color: {c["surface"]};
        border: 1px solid {c["border"]};
        border-radius: 8px;
        padding: 1rem;
        margin-bottom: 1rem;
    }}
    
    /* Button styling */
    .stButton>button {{
        background-color: {c["primary"]} !important;
        color: white !important;
        border: none !important;
        border-radius: 6px !important;
        width: 100%;
    }}
    
    /* Text input styling */
    .stTextInput>div>div>input {{
        background-color: {c["background"]} !important;
        color: {c["text"]} !important;
        border: 1px solid {c["border"]} !important;
    }}
    
    /* Titles */
    .main-title {{
        font-size: 2rem;
        font-weight: 700;
        color: {c["primary"]};
        margin-bottom: 1rem;
    }}
    .section-title {{
        font-size: 1.25rem;
        font-weight: 600;
        margin-bottom: 0.75rem;
    }}
    
    /* Metric styling */
    .metric-value {{
        font-size: 1.5rem;
        font-weight: 700;
        color: {c["primary"]};
    }}
    .metric-label {{
        font-size: 0.9rem;
        color: {c["muted"]};
    }}
    
    /* Badge styling */
    .badge {{
        padding: 0.2rem 0.5rem;
        border-radius: 4px;
        font-size: 0.75rem;
        font-weight: 600;
        background-color: {c["primary"]};
        color: white;
    }}
    </style>
    """
