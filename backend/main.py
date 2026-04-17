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

# Define static path (relative to project root)
PROJECT_ROOT = Path(__file__).parent.parent
FRONTEND_DIR = PROJECT_ROOT / "frontend"

app = FastAPI(title=settings.app_name, version=settings.app_version, docs_url="/docs", redoc_url="/redoc")

# Serve PWA files directly from /
@app.get("/manifest.json")
async def get_manifest():
    return FileResponse(FRONTEND_DIR / "manifest.json")

@app.get("/sw.js")
async def get_sw():
    return FileResponse(FRONTEND_DIR / "sw.js")

@app.get("/favicon.png")
async def get_favicon():
    return FileResponse(FRONTEND_DIR / "static" / "favicon.png")

@app.get("/icon-192.png")
async def get_icon192():
    return FileResponse(FRONTEND_DIR / "static" / "icon-192.png")

@app.get("/icon-512.png")
async def get_icon512():
    return FileResponse(FRONTEND_DIR / "static" / "icon-512.png")

@app.get("/styles.css")
async def get_css():
    return FileResponse(FRONTEND_DIR / "styles.css")

@app.get("/app.js")
async def get_js():
    return FileResponse(FRONTEND_DIR / "app.js")

# Mount frontend directory for everything else
app.mount("/static", StaticFiles(directory=FRONTEND_DIR / "static"), name="static")

@app.get("/")
async def serve_index():
    return FileResponse(FRONTEND_DIR / "index.html")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(auth_router)
app.include_router(tasks_router)
app.include_router(score_router)
