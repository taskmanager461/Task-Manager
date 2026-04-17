from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
import os
import logging
from pathlib import Path
from contextlib import asynccontextmanager

from backend.database import Base, engine
from backend.routes.auth import router as auth_router
from backend.routes.score import router as score_router
from backend.routes.tasks import router as tasks_router
from config.settings import get_settings

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Initialize database
    logger.info("Starting up and initializing database...")
    try:
        Base.metadata.create_all(bind=engine)
        logger.info("Database initialized successfully.")
    except Exception as e:
        logger.error(f"Database initialization failed: {e}")
        # In some cases we might want to continue even if DB fails
        # but for this app, DB is critical. 
    yield
    # Shutdown: Clean up if needed
    logger.info("Shutting down...")

settings = get_settings()

# Define static path (relative to project root)
PROJECT_ROOT = Path(__file__).parent.parent
FRONTEND_DIR = PROJECT_ROOT / "frontend"

app = FastAPI(
    title=settings.app_name, 
    version=settings.app_version, 
    docs_url="/docs", 
    redoc_url="/redoc",
    lifespan=lifespan
)

app.include_router(auth_router, prefix="/api")
app.include_router(tasks_router, prefix="/api")
app.include_router(score_router, prefix="/api")

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

# Mount frontend static directory
app.mount("/static", StaticFiles(directory=FRONTEND_DIR / "static"), name="static")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Catch-all route for SPA behavior
@app.get("/{full_path:path}")
async def serve_frontend(full_path: str):
    # If it's not an API call, serve index.html
    if full_path.startswith("api"):
        raise HTTPException(status_code=404, detail="API route not found")
    
    # Check if the file exists in frontend folder (for styles.css, app.js if not caught by direct routes)
    file_path = FRONTEND_DIR / full_path
    if file_path.is_file():
        return FileResponse(file_path)
        
    return FileResponse(FRONTEND_DIR / "index.html")
