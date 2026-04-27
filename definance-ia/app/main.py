from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from app.schemas.expense_schema import ExpenseRequest, ParsedExpense
from app.services.openai_service import parse_expense_text
from app.core.config import settings
from app.core.logging import logger
from typing import List

# Inicializa o FastAPI com metadados para a documentação automática (/docs)
app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="Microserviço de IA para processamento de linguagem natural financeira."
)

# Configuração de CORS (Segurança)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_HOSTS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health", tags=["Monitoramento"])
async def health_check():
    """Verifica se o serviço está online."""
    return {"status": "healthy", "version": settings.APP_VERSION}

@app.post("/parse-expense", response_model=ParsedExpense, tags=["IA"])
async def parse_expense(request: ExpenseRequest, categories: List[str] = []):
    """
    Recebe um texto e uma lista de categorias e retorna os dados financeiros estruturados.
    """
    logger.info("Recebida requisição de processamento.")
    return await parse_expense_text(request.text, categories)

if __name__ == "__main__":
    import uvicorn
    logger.info(f"Iniciando {settings.APP_NAME}...")
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)