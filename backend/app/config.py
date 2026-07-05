import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    openai_api_key: str = "mock-key"
    database_url: str = "sqlite:///./gonogo.db"
    environment: str = "development"
    allowed_origins: str = "http://localhost:3000"

    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()
