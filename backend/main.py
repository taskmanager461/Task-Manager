import logging
import os
from pathlib import Path
from contextlib import asynccontextmanager

# Configure logging immediately
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

from backend.database import Base, engine
from backend.routes.auth import router as auth_router
from backend.routes.score import router as score_router
from backend.routes.tasks import router as tasks_router
from config.settings import get_settings

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

logger.info(f"PROJECT_ROOT: {PROJECT_ROOT.absolute()}")
logger.info(f"FRONTEND_DIR: {FRONTEND_DIR.absolute()}")

if not FRONTEND_DIR.exists():
    logger.error(f"FRONTEND_DIR does not exist at {FRONTEND_DIR.absolute()}")
    # Create it if it doesn't exist to prevent crash
    FRONTEND_DIR.mkdir(parents=True, exist_ok=True)

STATIC_DIR = FRONTEND_DIR / "static"
if not STATIC_DIR.exists():
    logger.error(f"STATIC_DIR does not exist at {STATIC_DIR.absolute()}")
    STATIC_DIR.mkdir(parents=True, exist_ok=True)

ASSETS_DIR = FRONTEND_DIR / "public" / "assets"
ASSETS_DIR.mkdir(parents=True, exist_ok=True)

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

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

# Serve PWA files directly from /
@app.get("/manifest.json")
async def get_manifest():
    path = FRONTEND_DIR / "manifest.json"
    return FileResponse(path) if path.exists() else {"error": "manifest.json not found"}

@app.get("/sw.js")
async def get_sw():
    path = FRONTEND_DIR / "sw.js"
    if path.exists():
        return FileResponse(path, headers={"Cache-Control": "no-cache, no-store, must-revalidate"})
    return {"error": "sw.js not found"}

@app.get("/favicon.png")
async def get_favicon():
    path = STATIC_DIR / "favicon.png"
    return FileResponse(path) if path.exists() else {"error": "favicon.png not found"}

@app.get("/icon-192.png")
async def get_icon192():
    path = STATIC_DIR / "icon-192.png"
    return FileResponse(path) if path.exists() else {"error": "icon-192.png not found"}

@app.get("/icon-512.png")
async def get_icon512():
    path = STATIC_DIR / "icon-512.png"
    return FileResponse(path) if path.exists() else {"error": "icon-512.png not found"}

@app.get("/styles.css")
async def get_css():
    path = FRONTEND_DIR / "styles.css"
    return FileResponse(path) if path.exists() else {"error": "styles.css not found"}

@app.get("/app.js")
async def get_js():
    path = FRONTEND_DIR / "app.js"
    return FileResponse(path) if path.exists() else {"error": "app.js not found"}

# Mount frontend static directory
app.mount("/static", StaticFiles(directory=STATIC_DIR), name="static")
app.mount("/assets", StaticFiles(directory=ASSETS_DIR), name="assets")

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
    
    # Check if the file exists in frontend folder
    file_path = FRONTEND_DIR / full_path
    if file_path.is_file():
        return FileResponse(file_path)
        
    index_file = FRONTEND_DIR / "index.html"
    if index_file.exists():
        return FileResponse(index_file, headers={"Cache-Control": "no-cache, no-store, must-revalidate"})
    
    return {"message": "Frontend not found. Please ensure index.html exists in the frontend directory."}
