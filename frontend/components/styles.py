from __future__ import annotations


def get_theme_tokens(dark_mode: bool) -> dict[str, str]:
    if dark_mode:
        return {
            "bg": "#050507",
            "surface": "rgba(13, 13, 18, 0.92)",
            "surface_soft": "rgba(20, 20, 28, 1)",
            "sidebar": "rgba(5, 5, 7, 0.9)",
            "text": "#f8fafc",
            "muted": "#94a3b8",
            "accent": "#0a86ff",
            "accent_2": "#10b981",
            "accent_orange": "#f59e0b",
            "accent_red": "#ef4444",
            "border": "rgba(51, 65, 85, 0.5)",
            "success": "#22c55e",
            "danger": "#ef4444",
            "warning": "#f59e0b",
            "shadow": "0 8px 40px rgba(0, 0, 0, 0.4), 0 0 60px rgba(10, 134, 255, 0.1)",
        }

    return {
        "bg": "#f8fafc",
        "surface": "rgba(255, 255, 255, 0.95)",
        "surface_soft": "rgba(248, 250, 252, 1)",
        "sidebar": "#eef2ff",
        "text": "#0f172a",
        "muted": "#64748b",
        "accent": "#0a86ff",
        "accent_2": "#10b981",
        "accent_orange": "#f59e0b",
        "accent_red": "#ef4444",
        "border": "rgba(148, 163, 184, 0.3)",
        "success": "#22c55e",
        "danger": "#ef4444",
        "warning": "#f59e0b",
        "shadow": "0 10px 30px rgba(15, 23, 42, 0.08)",
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
    
    .stApp {{
        background: {c["bg"]};
        color: {c["text"]};
        font-family: "Inter", "Segoe UI", sans-serif;
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
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        cursor: pointer;
        border: none;
        background: transparent;
        padding: 8px 0;
    }}
    .nav-item:active {{
        transform: scale(0.9);
        background: rgba(56, 189, 248, 0.1);
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
    
    /* === EXACT METRIC CARD STYLES FROM IMAGE === */
    .metric-card {{
        position: relative;
        padding: 1.75rem;
        border-radius: 20px;
        background: {c["surface"]};
        border: 1px solid {c["border"]};
        overflow: hidden;
        backdrop-filter: blur(25px);
        -webkit-backdrop-filter: blur(25px);
    }}
    
    /* Left border glow - blue (default) */
    .metric-card::before {{
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        width: 6px;
        height: 100%;
        background: linear-gradient(to bottom, {c["accent"]}, {c["accent_2"]});
        box-shadow: 0 0 30px rgba(10, 134, 255, 0.6);
    }}
    
    /* Orange variant */
    .metric-card.orange::before {{
        background: linear-gradient(to bottom, {c["accent_orange"]}, {c["accent_red"]});
        box-shadow: 0 0 30px rgba(245, 158, 11, 0.6);
    }}
    
    /* Green variant */
    .metric-card.green::before {{
        background: linear-gradient(to bottom, {c["accent_2"]}, {c["accent"]});
        box-shadow: 0 0 30px rgba(16, 185, 129, 0.6);
    }}
    
    /* Bottom right glow - blue (default) */
    .metric-card::after {{
        content: '';
        position: absolute;
        bottom: -40px;
        right: -40px;
        width: 200px;
        height: 200px;
        background: radial-gradient(circle, rgba(10, 134, 255, 0.45) 0%, transparent 60%);
        pointer-events: none;
    }}
    
    .metric-card.orange::after {{
        background: radial-gradient(circle, rgba(245, 158, 11, 0.45) 0%, transparent 60%);
    }}
    
    .metric-card.green::after {{
        background: radial-gradient(circle, rgba(16, 185, 129, 0.45) 0%, transparent 60%);
    }}
    
    .metric-icon {{
        position: relative;
        z-index: 1;
        width: 56px;
        height: 56px;
        border-radius: 16px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1.9rem;
        color: {c["accent"]};
        border: 2px solid rgba(10, 134, 255, 0.4);
        margin-bottom: 1.1rem;
        background: transparent;
    }}
    
    .metric-card.orange .metric-icon {{
        color: {c["accent_orange"]};
        border-color: rgba(245, 158, 11, 0.4);
    }}
    
    .metric-card.green .metric-icon {{
        color: {c["accent_2"]};
        border-color: rgba(16, 185, 129, 0.4);
    }}
    
    .metric-label {{
        position: relative;
        z-index: 1;
        font-size: 0.95rem;
        color: {c["muted"]};
        margin-bottom: 0.35rem;
        font-weight: 500;
    }}
    
    .metric-value {{
        position: relative;
        z-index: 1;
        font-size: 2.75rem;
        font-weight: 700;
        color: {c["text"]};
        margin-bottom: 0.6rem;
        line-height: 1.1;
    }}
    
    .metric-badge {{
        position: relative;
        z-index: 1;
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.55rem 1.1rem;
        border-radius: 10px;
        background: rgba(239, 68, 68, 0.18);
        color: {c["danger"]};
        border: 1px solid rgba(239, 68, 68, 0.4);
        font-weight: 600;
        font-size: 0.85rem;
        width: fit-content;
    }}
    
    .metric-badge.success {{
        background: rgba(34, 197, 94, 0.18);
        color: {c["success"]};
        border: 1px solid rgba(34, 197, 94, 0.4);
    }}
    
    .metric-progress {{
        position: relative;
        z-index: 1;
        margin-top: 0.85rem;
        height: 8px;
        background: rgba(51, 65, 85, 0.4);
        border-radius: 9999px;
        overflow: hidden;
    }}
    
    .metric-progress-fill {{
        height: 100%;
        background: linear-gradient(90deg, {c["accent_2"]}, #059669);
        border-radius: 9999px;
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
