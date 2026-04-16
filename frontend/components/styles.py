from __future__ import annotations


def get_theme_tokens(dark_mode: bool) -> dict[str, str]:
    # Strictly 65% White, 35% Deep Blue
    # White background (65%), Deep Blue sidebar/accents (35%)
    return {
        "bg": "#ffffff", # Pure White Main Background
        "surface": "#ffffff", 
        "surface_soft": "#f8fafc",
        "sidebar": "#020617", # Deep Blue Sidebar (Part of the 35%)
        "text": "#020617", # Deepest Navy Text
        "muted": "#64748b",
        "accent": "#020617", # Deep Navy Accent
        "accent_2": "#020617", 
        "border": "#e2e8f0",
        "success": "#020617", 
        "danger": "#020617", 
        "shadow": "0 10px 30px rgba(2, 6, 23, 0.05)",
    }


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
        background: {c["bg"]};
        color: {c["text"]};
        font-family: "Inter", "Segoe UI", sans-serif;
        overflow-x: hidden;
    }}
    
    /* ULTRA THIN FREE MOVING DEEP BLUE LINES */
    .stApp::before {{
        content: "";
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: 
            linear-gradient(110deg, transparent 40%, rgba(2, 6, 23, 0.04) 40%, rgba(2, 6, 23, 0.04) 40.2%, transparent 40.2%),
            linear-gradient(200deg, transparent 20%, rgba(2, 6, 23, 0.03) 20%, rgba(2, 6, 23, 0.03) 20.3%, transparent 20.3%),
            linear-gradient(320deg, transparent 70%, rgba(2, 6, 23, 0.04) 70%, rgba(2, 6, 23, 0.04) 70.3%, transparent 70.3%);
        background-size: 200% 200%;
        pointer-events: none;
        z-index: 0;
        animation: floatLines 60s linear infinite;
    }}

    @keyframes floatLines {{
        0% {{ background-position: 0% 0%; }}
        100% {{ background-position: 100% 100%; }}
    }}

    /* Sidebar Styling for 35% Deep Blue */
    section[data-testid="stSidebar"] {{
        background-color: {c["sidebar"]} !important;
        color: #ffffff !important;
    }}
    section[data-testid="stSidebar"] * {{
        color: #ffffff !important;
    }}
    section[data-testid="stSidebar"] .stMarkdown h2 {{
        color: #ffffff !important;
    }}
    section[data-testid="stSidebar"] .stDivider {{
        border-color: rgba(255, 255, 255, 0.1) !important;
    }}

    /* Mobile Optimization & Bottom Nav */
    @media (max-width: 768px) {{
        .block-container {{
            padding-left: 0.8rem !important;
            padding-right: 0.8rem !important;
            padding-top: 1rem !important;
            padding-bottom: 6rem !important;
        }}
        section[data-testid="stSidebar"] {{
            position: fixed !important;
            left: -100% !important;
            width: 0 !important;
            visibility: hidden !important;
            z-index: -1 !important;
            display: block !important;
            opacity: 0 !important;
            pointer-events: none !important;
        }}
    }}

    /* STRICT WHITE & DEEP BLUE BOTTOM NAV */
    .bottom-nav {{
        position: fixed;
        bottom: 0;
        left: 0;
        right: 0;
        height: 80px;
        background: #ffffff; 
        border-top: 1px solid #e2e8f0;
        display: none;
        grid-template-columns: repeat(5, 1fr);
        z-index: 999999;
        box-shadow: 0 -10px 30px rgba(0,0,0,0.03);
        padding-bottom: env(safe-area-inset-bottom);
    }}
    @media (max-width: 768px) {{ .bottom-nav {{ display: grid; }} }}

    .nav-item {{
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 6px;
        color: rgba(2, 6, 23, 0.3); /* Faded Deep Blue */
        text-decoration: none !important;
        font-size: 0.7rem;
        font-weight: 800;
        transition: all 0.2s ease;
        cursor: pointer;
        border: none;
        background: transparent;
        padding: 10px 0;
        user-select: none;
        -webkit-tap-highlight-color: transparent;
    }}
    .nav-item.active {{
        color: #020617 !important; /* Strictly Deep Blue */
    }}
    .nav-item i {{ font-size: 1.6rem; }}
    .nav-item span {{ text-transform: uppercase; letter-spacing: 0.05em; }}

    /* Professional UI Refinement */
    .surface-card {{
        background: #ffffff;
        border: 1px solid #e2e8f0;
        border-radius: 24px;
        padding: 2rem;
        box-shadow: {c["shadow"]};
    }}
    
    .main-title {{
        font-size: 3rem;
        font-weight: 900;
        letter-spacing: -0.05em;
        color: #020617;
    }}

    /* STRICT DEEP BLUE INSTALL BUTTON */
    .install-btn {{
        background: #020617; 
        color: #ffffff !important; 
        padding: 18px 32px;
        border-radius: 16px;
        font-weight: 900;
        text-align: center;
        cursor: pointer;
        margin: 2rem 0;
        border: none;
        width: 100%;
        display: block;
        text-decoration: none !important;
        font-size: 1.1rem;
        text-transform: uppercase;
    }}

    /* Remove any remaining red from Streamlit components */
    .stButton>button {{
        background-color: #020617 !important;
        color: white !important;
        border: none !important;
    }}
    .stMarkdown a {{
        color: #020617 !important;
    }}
    /* Specifically target radio button selection color to avoid any red/blue default */
    div[data-testid="stWidgetLabel"] + div div[role="radiogroup"] label[data-baseweb="radio"] div:first-child {{
        border-color: #020617 !important;
    }}
    div[data-testid="stWidgetLabel"] + div div[role="radiogroup"] label[data-baseweb="radio"] div:first-child div {{
        background-color: #020617 !important;
    }}
    </style>
    <!-- Add FontAwesome -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
    """
