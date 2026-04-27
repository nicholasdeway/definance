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
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")
    GROQ_BASE_URL: str = "https://api.groq.com/openai/v1"
    MODEL_NAME: str = "llama-3.3-70b-versatile"
    
    # Segurança
    ALLOWED_HOSTS: list = ["*"]

settings = Settings()