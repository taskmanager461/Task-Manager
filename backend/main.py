from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.database import Base, engine
from backend.routes.auth import router as auth_router
from backend.routes.score import router as score_router
from backend.routes.tasks import router as tasks_router
from config.settings import get_settings

Base.metadata.create_all(bind=engine)
settings = get_settings()

def get_origins():
    raw_origins = settings.cors_origins
    if not raw_origins or raw_origins == "*":
        return ["*"]
    return [origin.strip() for origin in raw_origins.split(",") if origin.strip()]

app = FastAPI(title=settings.app_name, version=settings.app_version, docs_url="/docs", redoc_url="/redoc")

app.add_middleware(
    CORSMiddleware,
    allow_origins=get_origins(),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def healthcheck():
    return {
        "status": "ok",
        "service": settings.app_name,
        "version": settings.app_version,
        "environment": settings.environment,
    }


app.include_router(auth_router)
app.include_router(tasks_router)
app.include_router(score_router)
