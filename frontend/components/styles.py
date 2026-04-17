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
    /* Global Styles */
    .stApp {{
        background-color: {c["background"]};
        color: {c["text"]};
    }}
    
    /* Sidebar */
    [data-testid="stSidebar"] {{
        background-color: {c["surface"]};
        border-right: 1px solid {c["border"]};
    }}
    
    /* Cards */
    .surface-card {{
        background-color: {c["surface"]};
        border: 1px solid {c["border"]};
        border-radius: 8px;
        padding: 1rem;
        margin-bottom: 1rem;
    }}
    
    /* Typography */
    .main-title {{
        font-size: 2rem;
        font-weight: 700;
        margin-bottom: 1rem;
        color: {c["primary"]};
    }}
    
    .section-title {{
        font-size: 1.5rem;
        font-weight: 600;
        margin-top: 2rem;
        margin-bottom: 1rem;
    }}
    
    /* Buttons */
    .stButton>button {{
        background-color: {c["primary"]} !important;
        color: white !important;
        border-radius: 8px !important;
        border: none !important;
        min-height: 48px !important;
        padding: 0.5rem 1.5rem !important;
        font-weight: 600 !important;
        width: 100% !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        margin-bottom: 0.5rem !important;
        transition: transform 0.1s ease !important;
    }}
    
    .stButton>button:active {{
        transform: scale(0.98) !important;
    }}

    /* Mobile adjustments */
    @media (max-width: 768px) {{
        .stButton>button {{
            width: 100% !important;
        }}
    }}
    
    /* Metrics */
    .metric-card {{
        text-align: center;
    }}
    .metric-value {{
        font-size: 1.5rem;
        font-weight: 700;
    }}
    .metric-label {{
        font-size: 0.9rem;
        color: {c["muted"]};
    }}
    </style>
    """
