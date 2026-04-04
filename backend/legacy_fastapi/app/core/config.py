from pydantic_settings import BaseSettings, SettingsConfigDict
from pathlib import Path


BASE_DIR = Path(__file__).resolve().parents[2]
DB_PATH = BASE_DIR / "reimbursement.db"
ASYNC_DB_URI = f"sqlite+aiosqlite:///{DB_PATH.as_posix()}"
SYNC_DB_URI = f"sqlite:///{DB_PATH.as_posix()}"

class Settings(BaseSettings):
    PROJECT_NAME: str = "Reimbursement Management System"
    API_V1_STR: str = "/api/v1"
    
    # Database configuration for local SQLite
    SQLALCHEMY_DATABASE_URI: str = ASYNC_DB_URI
    SYNC_SQLALCHEMY_DATABASE_URI: str = SYNC_DB_URI
        
    # Celery configuration
    CELERY_BROKER_URL: str = "redis://localhost:6379/0"
    CELERY_RESULT_BACKEND: str = "redis://localhost:6379/0"
    
    # JWT authentication
    SECRET_KEY: str = "super-secret-key-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 8  # 8 days
    
    model_config = SettingsConfigDict(case_sensitive=True, env_file=".env", extra="ignore")

settings = Settings()
