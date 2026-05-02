from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

from config.settings import get_settings

settings = get_settings()
DATABASE_URL = settings.pg_url

# Log database type (safely)
if DATABASE_URL.startswith("sqlite"):
    print("Using SQLite database")
else:
    print(f"Using PostgreSQL database at {DATABASE_URL.split('@')[-1] if '@' in DATABASE_URL else 'unknown'}")

connect_args = {"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}

try:
    engine = create_engine(
        DATABASE_URL,
        connect_args=connect_args,
        pool_pre_ping=True,
    )
except Exception as e:
    print(f"Error creating engine: {e}")
    # Fallback to sqlite if engine creation fails
    engine = create_engine("sqlite:///./fallback.db", connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
