from __future__ import annotations


def get_theme_tokens(dark_mode: bool) -> dict[str, str]:
    if dark_mode:
        return {
            "bg": "#020617", # Deepest Navy
            "surface": "#0f172a", # Navy Blue
            "surface_soft": "#1e293b",
            "sidebar": "#020617",
            "text": "#f8fafc",
            "muted": "#94a3b8",
            "accent": "#3b82f6", # Brighter Blue
            "accent_2": "#2563eb", # Royal Blue
            "border": "#1e293b",
            "success": "#22c55e",
            "danger": "#ef4444",
            "shadow": "0 18px 45px rgba(2, 6, 23, 0.7)",
        }

    return {
        "bg": "#f8fafc",
        "surface": "#ffffff",
        "surface_soft": "#f1f5f9",
        "sidebar": "#eef2ff",
        "text": "#0f172a",
        "muted": "#64748b",
        "accent": "#1e3a8a", # Navy Blue
        "accent_2": "#2563eb", # Royal Blue
        "border": "#e2e8f0",
        "success": "#16a34a",
        "danger": "#dc2626",
        "shadow": "0 14px 35px rgba(15, 23, 42, 0.08)",
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
            transparent 120px,
            rgba(37, 99, 235, 0.04) 120px,
            rgba(37, 99, 235, 0.04) 121px
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
            font-size: 1.8rem !important;
        }}
        .metric-value {{
            font-size: 1.8rem !important;
        }}
        .surface-card {{
            padding: 1.2rem !important;
        }}
        [data-testid="stSidebarCollapsedControl"] {{
            display: none !important;
        }}
    }}
    /* Bottom Navigation Bar - Glassmorphism style */
    .bottom-nav {{
        position: fixed;
        bottom: 0;
        left: 0;
        right: 0;
        height: 75px;
        background: rgba(15, 23, 42, 0.85); /* Navy Blue translucent */
        backdrop-filter: blur(20px) saturate(180%);
        -webkit-backdrop-filter: blur(20px) saturate(180%);
        border-top: 1px solid rgba(255, 255, 255, 0.1);
        display: none;
        grid-template-columns: repeat(5, 1fr);
        z-index: 999999;
        box-shadow: 0 -10px 40px rgba(0,0,0,0.4);
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
        color: rgba(255, 255, 255, 0.5);
        text-decoration: none !important;
        font-size: 0.7rem;
        font-weight: 700;
        transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        cursor: pointer;
        border: none;
        background: transparent;
        padding: 8px 0;
        user-select: none;
        -webkit-tap-highlight-color: transparent;
    }}
    .nav-item:active {{
        transform: scale(0.9);
        background: rgba(255, 255, 255, 0.05);
    }}
    .nav-item.active {{
        color: {c["accent"]};
        text-shadow: 0 0 12px rgba(59, 130, 246, 0.4);
    }}
    .nav-item i {{
        font-size: 1.5rem;
    }}
    .nav-item span {{
        font-family: "Inter", sans-serif;
        text-transform: uppercase;
        letter-spacing: 0.02em;
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
        font-size: 3rem;
        font-weight: 900;
        margin-bottom: 0.5rem;
        letter-spacing: -0.05em;
        background: linear-gradient(135deg, {c["text"]} 0%, {c["accent"]} 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
    }}
    .main-subtitle {{
        color: {c["muted"]};
        margin-bottom: 2.5rem;
        font-weight: 500;
        font-size: 1.2rem;
        letter-spacing: -0.01em;
    }}
    .section-title {{
        font-size: 1.8rem;
        font-weight: 800;
        margin-top: 1.5rem;
        margin-bottom: 1.5rem;
        letter-spacing: -0.03em;
        color: {c["text"]};
    }}
    .surface-card {{
        background: {c["surface"]};
        border: 1px solid {c["border"]};
        border-radius: 28px;
        padding: 2rem;
        box-shadow: {c["shadow"]};
        transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
        animation: fadeIn 500ms ease-out;
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
        background: linear-gradient(135deg, rgba(255,255,255,0.03), transparent);
        pointer-events: none;
    }}
    .surface-card:hover {{
        transform: translateY(-8px);
        border-color: rgba(59, 130, 246, 0.4);
        box-shadow: 0 30px 70px rgba(0,0,0,0.3);
    }}
    /* Pro Metric Styles */
    .metric-card {{
        background: linear-gradient(145deg, {c["surface"]}, {c["surface_soft"]});
        border-radius: 28px;
        padding: 2rem;
        border: 1px solid {c["border"]};
        transition: all 0.3s ease;
    }}
    .metric-card:hover {{
        border-color: {c["accent"]};
    }}
    .metric-icon {{
        font-size: 2rem;
        margin-bottom: 1rem;
        padding: 14px;
        background: rgba(59, 130, 246, 0.1);
        border-radius: 18px;
        display: inline-block;
        color: {c["accent"]};
    }}
    .metric-label {{
        font-size: 1rem;
        font-weight: 700;
        color: {c["muted"]};
        margin-bottom: 0.8rem;
        text-transform: uppercase;
        letter-spacing: 0.08em;
    }}
    .metric-value {{
        font-size: 3rem;
        font-weight: 900;
        line-height: 1;
        color: {c["text"]};
        letter-spacing: -0.05em;
    }}
    .metric-sub {{
        font-size: 1rem;
        color: {c["success"]};
        font-weight: 800;
        margin-top: 1rem;
        display: flex;
        align-items: center;
        gap: 8px;
    }}
    /* Install Button Pro */
    .install-btn {{
        background: linear-gradient(135deg, {c["accent"]}, {c["accent_2"]});
        color: white !important;
        padding: 18px 32px;
        border-radius: 20px;
        font-weight: 800;
        text-align: center;
        cursor: pointer;
        box-shadow: 0 15px 30px rgba(37, 99, 235, 0.3);
        transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        margin: 1.5rem 0;
        border: none;
        width: 100%;
        display: block;
        text-decoration: none !important;
        font-size: 1.1rem;
        letter-spacing: 0.02em;
    }}
    .install-btn:hover {{
        transform: translateY(-4px);
        box-shadow: 0 20px 40px rgba(37, 99, 235, 0.45);
        filter: brightness(1.1);
    }}
    .install-btn:active {{
        transform: scale(0.96);
    }}
    .badge {{
        display: inline-flex;
        align-items: center;
        border-radius: 12px;
        padding: 6px 14px;
        font-size: 0.85rem;
        font-weight: 800;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        margin-right: 10px;
        margin-bottom: 10px;
    }}
    .badge-difficulty-easy {{
        background: rgba(34, 197, 94, 0.1);
        color: #4ade80;
        border: 1px solid rgba(34, 197, 94, 0.2);
    }}
    .badge-difficulty-medium {{
        background: rgba(59, 130, 246, 0.1);
        color: #60a5fa;
        border: 1px solid rgba(59, 130, 246, 0.2);
    }}
    .badge-difficulty-hard {{
        background: rgba(239, 68, 68, 0.1);
        color: #f87171;
        border: 1px solid rgba(239, 68, 68, 0.2);
    }}
    /* Progress Bars */
    .modern-progress-wrapper {{
        margin: 2rem 0;
    }}
    .modern-progress-label {{
        font-weight: 700;
        margin-bottom: 0.8rem;
        font-size: 1rem;
        color: {c["text"]};
    }}
    .modern-progress {{
        height: 14px;
        background: rgba(255,255,255,0.05);
        border-radius: 7px;
        overflow: hidden;
        border: 1px solid rgba(255,255,255,0.05);
    }}
    .modern-progress-fill {{
        height: 100%;
        border-radius: 7px;
        background: linear-gradient(90deg, {c["accent"]}, {c["accent_2"]});
        transition: width 0.8s cubic-bezier(0.4, 0, 0.2, 1);
    }}
    /* Modern Scrollbar */
    ::-webkit-scrollbar {{
        width: 12px;
    }}
    ::-webkit-scrollbar-track {{
        background: {c["bg"]};
    }}
    ::-webkit-scrollbar-thumb {{
        background: {c["border"]};
        border-radius: 12px;
        border: 3px solid {c["bg"]};
    }}
    ::-webkit-scrollbar-thumb:hover {{
        background: {c["muted"]};
    }}
    @keyframes fadeIn {{
        from {{ opacity: 0; transform: translateY(20px); }}
        to {{ opacity: 1; transform: translateY(0px); }}
    }}
    </style>
    <!-- Add FontAwesome for icons -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
    """
