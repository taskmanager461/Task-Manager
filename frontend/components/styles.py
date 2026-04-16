from __future__ import annotations


def get_theme_tokens(dark_mode: bool) -> dict[str, str]:
    # Fixed Deep Blue & White palette
    return {
        "bg": "#020617", # Deepest Navy
        "surface": "#0f172a", # Navy Blue
        "surface_soft": "#1e293b",
        "sidebar": "#020617",
        "text": "#ffffff", # Pure White
        "muted": "#94a3b8",
        "accent": "#ffffff", # White for accent in menu
        "accent_2": "#3b82f6", # Blue for progress/links
        "border": "#1e293b",
        "success": "#22c55e",
        "danger": "#ef4444",
        "shadow": "0 20px 50px rgba(0, 0, 0, 0.8)",
    }


def get_theme_css(dark_mode: bool) -> str:
    c = get_theme_tokens(dark_mode)
    return f"""
    <style>
    /* Hide Streamlit elements to make it look like a normal site */
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
    
    /* FREE MOVING THICK LINES BACKGROUND */
    .stApp::before {{
        content: "";
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: 
            linear-gradient(110deg, transparent 40%, rgba(59, 130, 246, 0.08) 40%, rgba(59, 130, 246, 0.08) 42%, transparent 42%),
            linear-gradient(200deg, transparent 20%, rgba(59, 130, 246, 0.05) 20%, rgba(59, 130, 246, 0.05) 23%, transparent 23%),
            linear-gradient(320deg, transparent 70%, rgba(59, 130, 246, 0.07) 70%, rgba(59, 130, 246, 0.07) 74%, transparent 74%);
        background-size: 200% 200%;
        pointer-events: none;
        z-index: 0;
        animation: floatLines 40s ease-in-out infinite alternate;
    }}

    @keyframes floatLines {{
        0% {{ background-position: 0% 0%; }}
        100% {{ background-position: 100% 100%; }}
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
        .main-title {{ font-size: 2rem !important; }}
    }}

    /* DEEP BLUE & WHITE BOTTOM NAV */
    .bottom-nav {{
        position: fixed;
        bottom: 0;
        left: 0;
        right: 0;
        height: 80px;
        background: #020617; /* Absolute Deep Blue */
        border-top: 2px solid rgba(255, 255, 255, 0.1);
        display: none;
        grid-template-columns: repeat(5, 1fr);
        z-index: 999999;
        box-shadow: 0 -15px 40px rgba(0,0,0,0.6);
        padding-bottom: env(safe-area-inset-bottom);
    }}
    @media (max-width: 768px) {{ .bottom-nav {{ display: grid; }} }}

    .nav-item {{
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 6px;
        color: rgba(255, 255, 255, 0.4); /* Faded White */
        text-decoration: none !important;
        font-size: 0.7rem;
        font-weight: 800;
        transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        cursor: pointer;
        border: none;
        background: transparent;
        padding: 10px 0;
        user-select: none;
        -webkit-tap-highlight-color: transparent;
    }}
    .nav-item:active {{ transform: scale(0.85); }}
    .nav-item.active {{
        color: #ffffff !important; /* Pure White */
        text-shadow: 0 0 15px rgba(255, 255, 255, 0.5);
    }}
    .nav-item i {{ font-size: 1.6rem; }}
    .nav-item span {{ text-transform: uppercase; letter-spacing: 0.05em; }}

    /* Professional UI Refinement */
    .block-container {{ padding-top: 2rem; padding-bottom: 2rem; max-width: 1200px; }}
    .surface-card {{
        background: {c["surface"]};
        border: 1px solid {c["border"]};
        border-radius: 30px;
        padding: 2rem;
        box-shadow: {c["shadow"]};
        transition: all 0.4s ease;
        animation: fadeIn 0.6s ease-out;
    }}
    .surface-card:hover {{
        border-color: rgba(255,255,255,0.2);
        transform: translateY(-5px);
    }}
    
    .main-title {{
        font-size: 3.5rem;
        font-weight: 900;
        letter-spacing: -0.05em;
        color: #ffffff;
    }}

    /* INSTALL BUTTON PRO - FIX */
    .install-btn {{
        background: #ffffff; /* White background */
        color: #020617 !important; /* Deep Blue text */
        padding: 20px 32px;
        border-radius: 22px;
        font-weight: 900;
        text-align: center;
        cursor: pointer;
        box-shadow: 0 15px 35px rgba(255, 255, 255, 0.15);
        transition: all 0.3s;
        margin: 2rem 0;
        border: none;
        width: 100%;
        display: block;
        text-decoration: none !important;
        font-size: 1.2rem;
        text-transform: uppercase;
    }}
    .install-btn:hover {{
        transform: translateY(-4px) scale(1.02);
        box-shadow: 0 20px 45px rgba(255, 255, 255, 0.25);
    }}

    @keyframes fadeIn {{
        from {{ opacity: 0; transform: translateY(20px); }}
        to {{ opacity: 1; transform: translateY(0px); }}
    }}
    </style>
    <!-- Add FontAwesome -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
    """
