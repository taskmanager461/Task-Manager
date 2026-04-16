from __future__ import annotations


def get_theme_tokens(dark_mode: bool) -> dict[str, str]:
    if dark_mode:
        return {
            "bg": "#020617", # Deepest Blue
            "surface": "#0f172a", # Navy Blue
            "surface_soft": "#1e293b",
            "sidebar": "#020617",
            "text": "#f8fafc",
            "muted": "#94a3b8",
            "accent": "#2563eb", # Royal Blue
            "accent_2": "#3b82f6", # Brighter Blue
            "border": "#1e293b",
            "success": "#22c55e",
            "danger": "#ef4444",
            "shadow": "0 18px 45px rgba(2, 6, 23, 0.6)",
        }

    return {
        "bg": "#f1f5f9",
        "surface": "#ffffff",
        "surface_soft": "#f8fafc",
        "sidebar": "#eef2ff",
        "text": "#0f172a",
        "muted": "#64748b",
        "accent": "#1e3a8a", # Navy Blue
        "accent_2": "#2563eb", # Royal Blue
        "border": "#dbeafe",
        "success": "#16a34a",
        "danger": "#dc2626",
        "shadow": "0 14px 35px rgba(15, 23, 42, 0.12)",
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
    
    .stApp {
        background: {c["bg"]};
        color: {c["text"]};
        font-family: "Inter", "Segoe UI", sans-serif;
        overflow-x: hidden;
    }
    
    /* Moving Blue Lines Background */
    .stApp::before {{
        content: "";
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: repeating-linear-gradient(
            45deg,
            transparent,
            transparent 100px,
            rgba(30, 58, 138, 0.03) 100px,
            rgba(30, 58, 138, 0.03) 101px
        );
        pointer-events: none;
        z-index: 0;
        animation: slideBackground 60s linear infinite;
    }}

    @keyframes slideBackground {{
        from {{ background-position: 0 0; }}
        to {{ background-position: 1000px 1000px; }}
    }}
    /* Mobile Optimization & Bottom Nav */
    @media (max-width: 768px) {{
        .block-container {{
            padding-left: 0.8rem !important;
            padding-right: 0.8rem !important;
            padding-top: 1rem !important;
            padding-bottom: 5rem !important; /* Space for bottom nav */
        }}
        /* Hide sidebar from view on mobile, but keep it in DOM for JS interactions */
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
        .main-title {{
            font-size: 1.6rem !important;
        }}
        .metric-value {{
            font-size: 1.8rem !important;
        }}
        .surface-card {{
            padding: 1rem !important;
        }}
        [data-testid="stSidebarCollapsedControl"] {{
            display: none !important;
        }}
    }}
    /* Bottom Navigation Bar */
    .bottom-nav {{
        position: fixed;
        bottom: 0;
        left: 0;
        right: 0;
        height: 70px;
        background: {c["surface"]}ee; /* Semi-transparent */
        backdrop-filter: blur(12px);
        -webkit-backdrop-filter: blur(12px);
        border-top: 1px solid {c["border"]};
        display: none;
        grid-template-columns: repeat(5, 1fr);
        z-index: 999999;
        box-shadow: 0 -10px 30px rgba(0,0,0,0.15);
        padding-bottom: env(safe-area-inset-bottom);
    }}
    @media (max-width: 768px) {{
        .bottom-nav {{
            display: grid;
        }}
    }}
    .nav-item {{
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 4px;
        color: {c["muted"]};
        text-decoration: none !important;
        font-size: 0.75rem;
        font-weight: 600;
        transition: all 0.2s ease-in-out;
        cursor: pointer;
        border: none;
        background: transparent;
        padding: 8px 0;
        user-select: none;
    }}
    .nav-item:active {{
        transform: scale(0.95);
        background: rgba(30, 58, 138, 0.15);
    }}
    .nav-item.active {{
        color: {c["accent"]};
    }}
    .nav-item i {{
        font-size: 1.4rem;
    }}
    .nav-item span {{
        font-family: "Inter", sans-serif;
    }}

    /* Professional UI Refinement */
    .block-container {{
        padding-top: 2rem;
        padding-bottom: 2rem;
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
        font-size: 2.8rem;
        font-weight: 900;
        margin-bottom: 0.4rem;
        letter-spacing: -0.04em;
        background: linear-gradient(135deg, {c["text"]}, {c["accent"]});
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
    }}
    .main-subtitle {{
        color: {c["muted"]};
        margin-bottom: 2rem;
        font-weight: 500;
        font-size: 1.1rem;
    }}
    .section-title {{
        font-size: 1.6rem;
        font-weight: 800;
        margin-top: 1.2rem;
        margin-bottom: 1.2rem;
        letter-spacing: -0.02em;
        color: {c["text"]};
    }}
    .surface-card {{
        background: {c["surface"]};
        border: 1px solid {c["border"]};
        border-radius: 24px;
        padding: 1.5rem;
        box-shadow: {c["shadow"]};
        transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        animation: fadeIn 400ms ease-out;
        position: relative;
        overflow: hidden;
    }}
    .surface-card::after {{
        content: "";
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: linear-gradient(135deg, rgba(255,255,255,0.05), transparent);
        pointer-events: none;
    }}
    .surface-card:hover {{
        transform: translateY(-6px);
        border-color: {c["accent"]};
        box-shadow: 0 25px 60px rgba(0,0,0,0.2);
    }}
    /* Pro Metric Styles */
    .metric-card {{
        background: linear-gradient(145deg, {c["surface"]}, {c["surface_soft"]});
        border-radius: 24px;
        padding: 1.8rem;
        border: 1px solid {c["border"]};
    }}
    .metric-icon {{
        font-size: 1.8rem;
        margin-bottom: 0.8rem;
        padding: 12px;
        background: rgba(56, 189, 248, 0.15);
        border-radius: 16px;
        display: inline-block;
    }}
    .metric-label {{
        font-size: 0.95rem;
        font-weight: 700;
        color: {c["muted"]};
        margin-bottom: 0.6rem;
        text-transform: uppercase;
        letter-spacing: 0.05em;
    }}
    .metric-value {{
        font-size: 2.6rem;
        font-weight: 900;
        line-height: 1.1;
        color: {c["text"]};
        letter-spacing: -0.04em;
    }}
    .metric-sub {{
        font-size: 0.9rem;
        color: {c["success"]};
        font-weight: 700;
        margin-top: 0.8rem;
        display: flex;
        align-items: center;
        gap: 6px;
    }}
    /* Install Button Pro */
    .install-btn {{
        background: linear-gradient(135deg, {c["accent"]}, {c["accent_2"]});
        color: white !important;
        padding: 14px 28px;
        border-radius: 16px;
        font-weight: 800;
        text-align: center;
        cursor: pointer;
        box-shadow: 0 12px 24px rgba(37, 99, 235, 0.25);
        transition: all 0.3s;
        margin: 1rem 0;
        border: none;
        width: 100%;
        display: block;
        text-decoration: none !important;
        font-size: 1rem;
    }}
    .install-btn:hover {{
        transform: translateY(-2px);
        box-shadow: 0 15px 30px rgba(37, 99, 235, 0.35);
    }}
    .install-btn:active {{
        transform: scale(0.98);
    }}
    .badge {{
        display: inline-flex;
        align-items: center;
        border-radius: 10px;
        padding: 5px 12px;
        font-size: 0.8rem;
        font-weight: 800;
        text-transform: uppercase;
        letter-spacing: 0.04em;
        margin-right: 8px;
        margin-bottom: 8px;
    }}
    .badge-difficulty-easy {{
        background: rgba(34, 197, 94, 0.15);
        color: #22c55e;
        border: 1px solid rgba(34, 197, 94, 0.3);
    }}
    .badge-difficulty-medium {{
        background: rgba(56, 189, 248, 0.15);
        color: #0ea5e9;
        border: 1px solid rgba(56, 189, 248, 0.3);
    }}
    .badge-difficulty-hard {{
        background: rgba(239, 68, 68, 0.15);
        color: #ef4444;
        border: 1px solid rgba(239, 68, 68, 0.3);
    }}
    /* Progress Bars */
    .modern-progress-wrapper {{
        margin: 1.5rem 0;
    }}
    .modern-progress-label {{
        font-weight: 700;
        margin-bottom: 0.6rem;
        font-size: 0.95rem;
    }}
    .modern-progress {{
        height: 12px;
        background: {c["border"]};
        border-radius: 6px;
        overflow: hidden;
    }}
    .modern-progress-fill {{
        height: 100%;
        border-radius: 6px;
        transition: width 0.6s cubic-bezier(0.4, 0, 0.2, 1);
    }}
    /* Modern Scrollbar */
    ::-webkit-scrollbar {{
        width: 10px;
    }}
    ::-webkit-scrollbar-track {{
        background: {c["bg"]};
    }}
    ::-webkit-scrollbar-thumb {{
        background: {c["border"]};
        border-radius: 10px;
        border: 2px solid {c["bg"]};
    }}
    ::-webkit-scrollbar-thumb:hover {{
        background: {c["muted"]};
    }}
    @keyframes fadeIn {{
        from {{ opacity: 0; transform: translateY(15px); }}
        to {{ opacity: 1; transform: translateY(0px); }}
    }}
    </style>
    <!-- Add FontAwesome for icons -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
    """
