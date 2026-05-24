from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from app.schemas.expense_schema import ExpenseRequest, ParsedExpense
from app.schemas.chat_schema import ChatRequest, ChatResponse
from app.services.openai_service import parse_expense_text, transcribe_audio_url
from app.services.chat_service import process_chat
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
async def parse_expense(request: ExpenseRequest):
    """
    Recebe um texto e uma lista de categorias e retorna os dados financeiros estruturados.
    """
    logger.info(f"Recebida requisição de processamento: {request.text}")
    return await parse_expense_text(request.text, request.categories)

@app.post("/api/chat", response_model=ChatResponse, tags=["IA"])
async def chat(request: ChatRequest):
    """
    Endpoint conversacional integrado com WhatsApp e Function Calling.
    """
    message_text = request.message
    if request.audio_url:
        logger.info(f"Processando áudio recebido de {request.phone_number}: {request.audio_url}")
        try:
            transcription = await transcribe_audio_url(request.audio_url)
            logger.info(f"Áudio transcrito com sucesso: '{transcription}'")
            message_text = transcription
        except Exception as e:
            logger.error(f"Erro ao transcrever áudio: {str(e)}")
            # Retorna uma mensagem amigável de erro se a transcrição falhar
            return ChatResponse(reply="⚠️ Não consegui entender o áudio. Por favor, tente enviar novamente com mais clareza ou digite a mensagem.")
            
    logger.info(f"Mensagem processada de {request.phone_number}: {message_text}")
    reply = await process_chat(
        user_id=request.user_id,
        phone_number=request.phone_number,
        user_name=request.user_name,
        message=message_text,
        token=request.token
    )
    return ChatResponse(reply=reply)

if __name__ == "__main__":
    import uvicorn
    logger.info(f"Iniciando {settings.APP_NAME}...")
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)