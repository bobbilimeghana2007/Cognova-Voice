"""
Cognova Voice — Application Configuration Module
Centralized settings management with pydantic-settings, supporting free-tier providers.
"""
from typing import List, Optional
from pydantic_settings import BaseSettings
from pydantic import Field
import os

class Settings(BaseSettings):
    APP_NAME: str = "Cognova Voice"
    APP_ENV: str = "development"
    DEBUG: bool = True
    PORT: int = 8000
    
    # Security
    SECRET_KEY: str = "cognova_vortex2k26_super_secret_jwt_key_change_in_production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440
    
    # CORS
    CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:3000",
        "*"
    ]
    
    # Database
    DATABASE_URL: str = "sqlite:///./cognova.db"
    
    # Storage
    UPLOADS_DIR: str = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "uploads")
    CHROMA_PERSIST_DIR: str = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "data", "vector_store")
    
    # LLM Settings (Free-tier prioritized)
    LLM_PROVIDER: str = "gemini"  # gemini | groq | mock
    GEMINI_API_KEY: Optional[str] = None
    GEMINI_MODEL: str = "gemini-1.5-flash"
    GROQ_API_KEY: Optional[str] = None
    GROQ_MODEL: str = "llama-3.1-70b-versatile"
    
    # Embedding Configuration
    EMBEDDING_PROVIDER: str = "sentence_transformers"  # sentence_transformers | gemini | mock
    EMBEDDING_MODEL: str = "all-MiniLM-L6-v2"
    
    # Voice Settings
    STT_PROVIDER: str = "browser_native"
    TTS_PROVIDER: str = "browser_native"
    
    # Demo Mode
    DEMO_MODE_ENABLED: bool = True
    DEFAULT_DEMO_STUDENT: str = "Meghana"
    DEFAULT_DEMO_CAREER: str = "Data Scientist"

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        extra = "ignore"

settings = Settings()
