from __future__ import annotations


def get_theme_tokens(dark_mode: bool) -> dict[str, str]:
    if dark_mode:
        base = {
            "primary": "#0A1F44",
            "secondary": "#123A7A",
            "background": "#0B0F1A",
            "text": "#FFFFFF",
            "accent": "#4DA3FF",
            "accent_2": "#82C4FF",
        }
        base.update(
            {
                "bg": base["background"],
                "surface": "#121826",
                "surface_soft": "#1B2438",
                "sidebar": base["primary"],
                "muted": "#9CA3AF",
                "accent_light": "#1E3A5F",
                "glow": "rgba(77, 163, 255, 0.25)",
                "border": "#253247",
                "success": "#82C4FF",
                "danger": "#4DA3FF",
                "shadow": "0 10px 30px rgba(2, 6, 23, 0.45)",
            }
        )
        return base

    base = {
        "primary": "#0A1F44",
        "secondary": "#123A7A",
        "background": "#FFFFFF",
        "text": "#111111",
        "accent": "#1E90FF",
        "accent_2": "#63B3FF",
    }
    base.update(
        {
            "bg": base["background"],
            "surface": "#FFFFFF",
            "surface_soft": "#F4F8FC",
            "sidebar": base["primary"],
            "muted": "#64748B",
            "accent_light": "#E6F2FF",
            "glow": "rgba(30, 144, 255, 0.20)",
            "border": "#D9E3EF",
            "success": "#123A7A",
            "danger": "#123A7A",
            "shadow": "0 10px 30px rgba(10, 31, 68, 0.08)",
        }
    )
    return base


def get_theme_css(dark_mode: bool) -> str:
    c = get_theme_tokens(dark_mode)
    return f"""
    <style>
    /* Hide Streamlit elements */
    #MainMenu {{visibility: hidden;}}
    header {{visibility: hidden;}}
    footer {{visibility: hidden;}}
    div[data-testid="stStatusWidget"] {{visibility: hidden;}}
    [data-testid="stHeader"] {{background: transparent; height: 0;}}
    .stAppDeployButton {{display: none !important;}}
    
    .hidden-nav-container {{
        display: none !important;
    }}
    
    .stApp {{
        background: {c["background"]};
        color: {c["text"]};
        font-family: "Inter", "Segoe UI", sans-serif;
        overflow-x: hidden;
    }}
    
    /* SUBTLE ANIMATED GRADIENT LINES */
    .stApp::before {{
        content: "";
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: 
            linear-gradient(110deg, transparent 40%, rgba(10, 31, 68, 0.04) 40%, rgba(18, 58, 122, 0.04) 40.2%, transparent 40.2%),
            linear-gradient(200deg, transparent 20%, rgba(10, 31, 68, 0.03) 20%, rgba(18, 58, 122, 0.03) 20.3%, transparent 20.3%),
            linear-gradient(320deg, transparent 70%, rgba(10, 31, 68, 0.04) 70%, rgba(18, 58, 122, 0.04) 70.3%, transparent 70.3%);
        background-size: 200% 200%;
        pointer-events: none;
        z-index: 0;
        animation: slowMove 60s linear infinite;
    }}

    @keyframes slowMove {{
        0% {{ background-position: 0% 0%; }}
        100% {{ background-position: 100% 100%; }}
    }}

    /* Dashboard & Section Polish */
    .surface-card, div[data-testid="stVerticalBlock"] > div[style*="border"] {{
        background: {c["surface"]};
        border: 1px solid {c["border"]} !important;
        border-radius: 20px !important;
        padding: 1.5rem;
        box-shadow: {c["shadow"]};
        transition: transform 0.3s ease, box-shadow 0.3s ease;
    }}
    .surface-card:hover {{
        transform: translateY(-2px);
        box-shadow: 0 15px 35px rgba(10, 31, 68, 0.12);
    }}

    /* Sidebar Styling - Dark Blue */
    section[data-testid="stSidebar"] {{
        background-color: {c["sidebar"]} !important;
        background-image: linear-gradient(180deg, {c["sidebar"]} 0%, {c["secondary"]} 100%) !important;
    }}
    section[data-testid="stSidebar"] * {{
        color: #ffffff !important;
    }}
    section[data-testid="stSidebar"] .stDivider {{
        border-color: rgba(255, 255, 255, 0.1) !important;
    }}

    /* Button Performance & Feel */
    .stButton>button {{
        background-color: {c["primary"]} !important;
        color: white !important;
        border: none !important;
        border-radius: 12px !important;
        padding: 0.6rem 1.2rem !important;
        font-weight: 600 !important;
        transition: all 0.15s cubic-bezier(0.4, 0, 0.2, 1) !important;
        box-shadow: 0 4px 6px rgba(10, 31, 68, 0.1) !important;
        width: 100% !important;
    }}
    .stButton>button:hover {{
        background-color: {c["secondary"]} !important;
        transform: translateY(-1px) !important;
        box-shadow: 0 6px 12px rgba(10, 31, 68, 0.15) !important;
    }}
    .stButton>button:active {{
        transform: translateY(0px) !important;
        filter: brightness(0.9) !important;
    }}

    /* Instant Feedback for Inputs */
    .stTextInput>div>div>input {{
        border-radius: 12px !important;
        border: 1px solid {c["border"]} !important;
        transition: all 0.2s ease !important;
    }}
    .stTextInput>div>div>input:focus {{
        border-color: {c["accent"]} !important;
        box-shadow: 0 0 0 3px {c["glow"]} !important;
    }}

    /* Mobile Bottom Nav */
    .bottom-nav {{
        position: fixed;
        bottom: 0;
        left: 0;
        right: 0;
        height: 70px;
        background: {"rgba(18, 24, 38, 0.95)" if dark_mode else "rgba(255, 255, 255, 0.95)"};
        backdrop-filter: blur(10px);
        border-top: 1px solid {c["border"]};
        display: none;
        grid-template-columns: repeat(5, 1fr);
        z-index: 999999;
        padding-bottom: env(safe-area-inset-bottom);
    }}
    @media (max-width: 768px) {{ .bottom-nav {{ display: grid; }} }}

    .nav-item {{
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        color: {c["muted"]};
        font-size: 0.65rem;
        font-weight: 600;
        transition: all 0.2s ease;
        cursor: pointer;
        -webkit-tap-highlight-color: transparent;
    }}
    .nav-item.active {{
        color: {c["accent"]};
    }}
    .nav-item i {{ font-size: 1.4rem; margin-bottom: 2px; }}

    /* Professional Titles */
    .main-title {{
        font-size: 2.5rem;
        font-weight: 800;
        color: {c["primary"]};
        letter-spacing: -0.02em;
        margin-bottom: 0.5rem;
    }}
    .main-subtitle {{
        color: {c["muted"]};
        font-size: 1rem;
        font-weight: 500;
        margin-bottom: 1.2rem;
    }}
    .section-title {{
        font-size: 1.25rem;
        font-weight: 700;
        color: {c["primary"]};
        letter-spacing: -0.01em;
        margin: 1rem 0 0.75rem 0;
    }}
    .metric-label {{
        color: {c["muted"]};
        font-size: 0.9rem;
        font-weight: 600;
    }}
    .metric-value {{
        color: {c["text"]};
        font-size: 2rem;
        font-weight: 800;
        line-height: 1.2;
    }}
    .metric-sub {{
        color: {c["muted"]};
        font-size: 0.85rem;
    }}
    .task-title {{
        color: {c["text"]};
        font-size: 1.05rem;
        font-weight: 700;
    }}
    .task-meta {{
        display: flex;
        gap: 0.5rem;
        margin-top: 0.5rem;
        flex-wrap: wrap;
    }}
    .badge {{
        display: inline-flex;
        align-items: center;
        border-radius: 999px;
        padding: 0.3rem 0.65rem;
        font-size: 0.75rem;
        font-weight: 700;
    }}
    .badge-difficulty-easy {{
        background: rgba(99, 179, 255, 0.12);
        color: {c["secondary"]};
    }}
    .badge-difficulty-medium {{
        background: rgba(30, 144, 255, 0.15);
        color: {c["accent"]};
    }}
    .badge-difficulty-hard {{
        background: rgba(10, 31, 68, 0.15);
        color: {c["primary"]};
    }}
    
    /* REMOVE ALL RED */
    .stAlert {{ border-left-color: {c["accent"]} !important; }}
    div[data-testid="stNotification"] {{ background-color: {c["surface_soft"]} !important; color: {c["primary"]} !important; }}
    
    /* Custom Install Button */
    .install-btn {{
        background: linear-gradient(135deg, {c["primary"]} 0%, {c["accent"]} 100%);
        color: white !important;
        padding: 14px 24px;
        border-radius: 14px;
        font-weight: 700;
        text-align: center;
        cursor: pointer;
        border: none;
        width: 100%;
        display: block;
        text-decoration: none !important;
        box-shadow: 0 4px 15px {c["glow"]};
    }}
    </style>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
    """
