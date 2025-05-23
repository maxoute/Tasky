"""
Configuration centralisée de l'application
"""

from typing import List, Optional
from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    # Informations générales
    PROJECT_NAME: str = "Mentor IA"
    VERSION: str = "1.0.0"
    API_PREFIX: str = "/api/v1"
    ENVIRONMENT: str = "development"
    API_VERSION: str = "v1"
    DEBUG: bool = False
    
    # Sécurité
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    
    # CORS - Support des deux formats
    ALLOWED_ORIGINS: List[str] = ["http://localhost:3000", "http://localhost:3001"]
    CORS_ORIGINS: Optional[str] = None  # Format string JSON du .env
    
    # Base de données
    SUPABASE_URL: str
    SUPABASE_KEY: str
    
    # APIs externes
    OPENAI_API_KEY: Optional[str] = None
    OLLAMA_MODEL: Optional[str] = "llama3"
    
    # Redis (pour le cache)
    REDIS_URL: Optional[str] = "redis://localhost:6379"
    
    # Logs
    LOG_LEVEL: str = "INFO"
    
    class Config:
        env_file = ".env"
        case_sensitive = True
        extra = "ignore"  # Ignore les champs supplémentaires


@lru_cache()
def get_settings() -> Settings:
    """
    Retourne l'instance des settings (cached)
    """
    return Settings()


settings = get_settings() 