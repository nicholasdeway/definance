import os
from dotenv import load_dotenv
from pydantic_settings import BaseSettings

load_dotenv()

class Settings(BaseSettings):
    """
    Configurações globais da aplicação.
    Centraliza todas as variáveis de ambiente e constantes.
    """
    APP_NAME: str = "Definance IA"
    APP_VERSION: str = "1.0.0"
    
    # API Groq/OpenAI
    GROQ_API_KEY: str = os.getenv("GROQ_API_KEY") or os.getenv("OPENAI_API_KEY") or ""
    GROQ_BASE_URL: str = "https://api.groq.com/openai/v1"
    MODEL_NAME: str = os.getenv("MODEL_NAME", "llama-3.3-70b-versatile")
    
    # Backend C#
    BACKEND_URL: str = os.getenv("BACKEND_URL", "http://localhost:5137")
    
    # Segurança
    ALLOWED_HOSTS: list = ["*"]

settings = Settings()