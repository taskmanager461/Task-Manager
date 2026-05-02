from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
import os
from pathlib import Path

from backend.database import Base, engine
from backend.routes.auth import router as auth_router
from backend.routes.score import router as score_router
from backend.routes.tasks import router as tasks_router
from config.settings import get_settings

Base.metadata.create_all(bind=engine)
settings = get_settings()

# Define project paths
PROJECT_ROOT = Path(__file__).parent.parent
STATIC_DIR = PROJECT_ROOT / "frontend" / "static"
FRONTEND_DIR = PROJECT_ROOT / "frontend"
ASSETS_DIR = FRONTEND_DIR / "public" / "assets"
INDEX_FILE = FRONTEND_DIR / "index.html"

def get_origins():
    raw_origins = settings.cors_origins
    if not raw_origins or raw_origins == "*":
        return ["*"]
    return [origin.strip() for origin in raw_origins.split(",") if origin.strip()]

app = FastAPI(title=settings.app_name, version=settings.app_version, docs_url="/docs", redoc_url="/redoc")


@app.get("/", include_in_schema=False)
async def serve_frontend_root():
    # In single-service deployment, always render the frontend shell at root.
    return FileResponse(INDEX_FILE)

# Serve PWA files directly from /
@app.get("/manifest.json")
async def get_manifest():
    return FileResponse(STATIC_DIR / "manifest.json")

@app.get("/sw.js")
async def get_sw():
    return FileResponse(STATIC_DIR / "sw.js")

@app.get("/icon-192.png")
async def get_icon192():
    return FileResponse(STATIC_DIR / "icon-192.png")

@app.get("/icon-512.png")
async def get_icon512():
    return FileResponse(STATIC_DIR / "icon-512.png")

# --- DATABASE CLEANUP LOGIC FOR FREE TIER ---
from sqlalchemy import text
if os.getenv("CLEANUP_DATABASE") == "true":
    try:
        with engine.connect() as conn:
            conn.execute(text("TRUNCATE TABLE users, tasks, daily_scores RESTART IDENTITY CASCADE;"))
            conn.commit()
            print("✅ DATABASE CLEANED SUCCESSFULLY")
    except Exception as e:
        print(f"❌ CLEANUP FAILED: {e}")
# --------------------------------------------

app.add_middleware(
    CORSMiddleware,
    allow_origins=get_origins(),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def healthcheck():
    return {
        "status": "ok",
        "service": settings.app_name,
        "version": settings.app_version,
        "environment": settings.environment,
    }


app.include_router(auth_router, prefix="/api")
app.include_router(tasks_router, prefix="/api")
app.include_router(score_router, prefix="/api")

# Serve branding assets under /assets
app.mount("/assets", StaticFiles(directory=ASSETS_DIR), name="assets")

# Serve frontend app at root
app.mount("/", StaticFiles(directory=FRONTEND_DIR, html=True), name="frontend")
