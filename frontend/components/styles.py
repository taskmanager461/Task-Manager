from __future__ import annotations


def get_theme_tokens(dark_mode: bool) -> dict[str, str]:
    # 65% White, 35% Dark Blue balance
    return {
        "bg": "#ffffff", # Main background is now White
        "surface": "#f1f5f9", # Light gray/white surface
        "surface_soft": "#e2e8f0",
        "sidebar": "#ffffff",
        "text": "#020617", # Text is now Deepest Navy
        "muted": "#64748b",
        "accent": "#020617", # Accent is now Deep Navy
        "accent_2": "#2563eb", # Royal Blue for progress
        "border": "#e2e8f0",
        "success": "#22c55e",
        "danger": "#020617", # Changed from Red to Deep Navy
        "shadow": "0 10px 30px rgba(2, 6, 23, 0.1)",
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
    
    /* FREE MOVING THICK LINES BACKGROUND - Intense Dark Blue Lines */
    .stApp::before {{
        content: "";
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: 
            linear-gradient(110deg, transparent 40%, rgba(2, 6, 23, 0.12) 40%, rgba(2, 6, 23, 0.12) 43%, transparent 43%),
            linear-gradient(200deg, transparent 20%, rgba(2, 6, 23, 0.1) 20%, rgba(2, 6, 23, 0.1) 24%, transparent 24%),
            linear-gradient(320deg, transparent 70%, rgba(2, 6, 23, 0.12) 70%, rgba(2, 6, 23, 0.12) 75%, transparent 75%);
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
        .main-title {{ font-size: 2.2rem !important; }}
    }}

    /* WHITE & DEEP BLUE BOTTOM NAV */
    .bottom-nav {{
        position: fixed;
        bottom: 0;
        left: 0;
        right: 0;
        height: 80px;
        background: #ffffff; /* White Background (65%) */
        border-top: 2px solid #e2e8f0;
        display: none;
        grid-template-columns: repeat(5, 1fr);
        z-index: 999999;
        box-shadow: 0 -10px 30px rgba(0,0,0,0.05);
        padding-bottom: env(safe-area-inset-bottom);
    }}
    @media (max-width: 768px) {{ .bottom-nav {{ display: grid; }} }}

    .nav-item {{
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 6px;
        color: rgba(2, 6, 23, 0.4); /* Faded Deep Blue */
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
    .nav-item:active {{ transform: scale(0.9); }}
    .nav-item.active {{
        color: #020617 !important; /* Deep Blue (35%) */
    }}
    .nav-item i {{ font-size: 1.6rem; }}
    .nav-item span {{ text-transform: uppercase; letter-spacing: 0.05em; }}

    /* Professional UI Refinement */
    .block-container {{ padding-top: 2rem; padding-bottom: 2rem; max-width: 1200px; }}
    .surface-card {{
        background: #ffffff;
        border: 1px solid #e2e8f0;
        border-radius: 30px;
        padding: 2rem;
        box-shadow: {c["shadow"]};
        transition: all 0.4s ease;
        animation: fadeIn 0.6s ease-out;
    }}
    .surface-card:hover {{
        border-color: #020617;
        transform: translateY(-5px);
    }}
    
    .main-title {{
        font-size: 3.5rem;
        font-weight: 900;
        letter-spacing: -0.05em;
        color: #020617;
    }}

    /* INSTALL BUTTON PRO - DEEP BLUE */
    .install-btn {{
        background: #020617; /* Deep Blue background */
        color: #ffffff !important; /* White text */
        padding: 20px 32px;
        border-radius: 22px;
        font-weight: 900;
        text-align: center;
        cursor: pointer;
        box-shadow: 0 15px 35px rgba(2, 6, 23, 0.2);
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
        transform: translateY(-4px);
        box-shadow: 0 20px 45px rgba(2, 6, 23, 0.3);
    }}

    @keyframes fadeIn {{
        from {{ opacity: 0; transform: translateY(20px); }}
        to {{ opacity: 1; transform: translateY(0px); }}
    }}
    </style>
    <!-- Add FontAwesome -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
    """
