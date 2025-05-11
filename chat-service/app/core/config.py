from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    # API
    API_V1_STR: str = "/api/v1"
    PROJECT_NAME: str = "RAG Chatbot Backend"
    
    # MongoDB
    MONGODB_URL: str = "mongodb://mongodb:27017"
    MONGODB_DB: str = "rag_chatbot"
    
    # OpenAI
    OPENAI_API_KEY: str 
    OPENAI_MODEL: str = "gpt-4o"
    
    # Vector Store
    VECTOR_STORE_PATH: str = "./data/vector_store"
    
    class Config:
        case_sensitive = True
        env_file = ".env"

settings = Settings() 