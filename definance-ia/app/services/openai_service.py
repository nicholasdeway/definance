import json
from openai import AsyncOpenAI
from app.schemas.expense_schema import ParsedExpense
from app.core.config import settings
from app.core.logging import logger
from typing import List

# Inicializa o cliente usando as configurações centralizadas
client = AsyncOpenAI(
    api_key=settings.GROQ_API_KEY,
    base_url=settings.GROQ_BASE_URL
)

def get_system_prompt(categories: List[str]) -> str:
    """
    Gera o prompt do sistema dinamicamente com base nas categorias do usuário.
    
    Args:
        categories: Lista de nomes de categorias existentes no banco de dados.
        
    Returns:
        String contendo as instruções completas para o LLM.
    """
    categories_str = ", ".join(categories) if categories else "Outros"
    
    return f"""
    Você é um assistente financeiro especializado em extrair dados de movimentações financeiras (Entradas e Saídas).
    Seu objetivo é transformar frases informais em dados estruturados (JSON).

    Regras:
    1. Extraia o ITEM/DESCRIÇÃO da transação (nome do produto, serviço ou local comprado), o VALOR e a CATEGORIA.
    2. Identifique se é uma 'Entrada' (recebimento, ganho, salário, venda) ou 'Saída' (gasto, compra, pagamento).
    3. O valor deve ser um número float.
    4. Identifique se o usuário mencionou 'hoje' ou 'ontem'.
    
    CATEGORIAS DISPONÍVEIS (com seus respectivos tipos e palavras-chave):
    [{categories_str}]

    5. AVALIAÇÃO DE CATEGORIAS (Siga ESTES PASSOS rigorosamente):
       - As categorias são enviadas no formato "Nome [Tipo] (palavras-chave)". O [Tipo] indica se a categoria serve para 'Entrada', 'Saída' ou 'Ambos'.
       - Primeiro identifique se a transação do usuário é uma 'Entrada' ou 'Saída'.
       - Você SÓ PODE escolher uma categoria cujo [Tipo] corresponda à transação (ou que seja [Ambos]). NUNCA use uma categoria [Entrada] para um gasto/saída, nem uma categoria [Saída] para um ganho/receita.
       PASSO 1: O NOME de alguma categoria permitida aparece ESCRITO NA FRASE? 
                - Exemplo: frase="jogos da steam", categoria="Steam [Saída]". 
                - Se SIM: Escolha essa categoria IMEDIATAMENTE e ignore os demais passos.
       PASSO 2: Se não houver correspondência de nome, procure pelas palavras-chave entre parênteses. 
       PASSO 3: Se não achar nada, use a intuição semântica dentro das categorias permitidas para o tipo da transação.
    6. IMPORTANTE: No campo "category" do JSON, retorne APENAS o NOME EXATO da categoria (sem o [Tipo] e sem as palavras-chave).
    7. Se nenhuma categoria da lista servir, use 'Outros'.
    
    8. Retorne APENAS o JSON no formato abaixo:
    {{
      "name": "Descrição da transação (ex: Fralda para Celso, Leite, Uber)",
      "amount": 0.0,
      "category": "Nome da Categoria",
      "type": "Entrada" ou "Saída",
      "date": "hoje/ontem",
      "confidence": 0.95
    }}

    9. IMPORTANTE sobre o campo "name" (Descrição da transação):
       - Formate o nome de maneira legível em PORTUGUÊS, garantindo que a primeira letra seja maiúscula. É ABSOLUTAMENTE OBRIGATÓRIO identificar, corrigir erros de digitação/ortografia e aplicar a acentuação correta em português (ex: se o usuário disser 'cafe', mude para 'Café'; se disser 'pao', mude para 'Pão'; se disser 'almoco', mude para 'Almoço'; se disser 'agua', mude para 'Água'; se disser 'gaz', mude para 'Gás').
       - Corrija contrações informais e gírias para manter a descrição formal (ex: 'pra' vira 'para', 'pro' vira 'para o', 'vc' vira 'você').
       - NUNCA extraia apenas o nome próprio de uma pessoa (como "Celso") como o campo "name" principal da transação. O campo "name" deve refletir o que foi comprado ou pago (ex: se o texto diz "fralda pro celso", o name deve ser "Fralda para o Celso" ou "Fralda", mas nunca apenas "Celso").
       - Preserve nomes de marcas/empresas (ex: 'Steam', 'Uber', 'Ifood').
    """

async def parse_expense_text(text: str, categories: List[str] = []) -> ParsedExpense:
    """
    Envia o texto do usuário para a IA e processa o retorno JSON.
    
    Args:
        text: A frase digitada pelo usuário (ex: "cafe 5 reais hoje").
        categories: Lista de categorias para o Grounding da IA.
        
    Returns:
        Um objeto ParsedExpense com os dados extraídos.
    """
    try:
        logger.info(f"Processando texto: '{text}' com {len(categories)} categorias.")
        
        response = await client.chat.completions.create(
            model=settings.MODEL_NAME,
            messages=[
                {"role": "system", "content": get_system_prompt(categories)},
                {"role": "user", "content": text}
            ],
            temperature=0,
            response_format={ "type": "json_object" }
        )
        
        content = response.choices[0].message.content
        if not content:
            raise ValueError("A resposta da IA está vazia.")
        data = json.loads(content)
        
        # Garante que o nome comece com letra maiúscula
        if "name" in data and data["name"]:
            data["name"] = data["name"][0].upper() + data["name"][1:]
            
        import re
        text_lower = text.lower()
        for cat in categories:
            # cat pode estar no formato "Nome [Tipo] (keywords)" ou "Nome [Tipo]"
            cat_name = cat.split("[")[0].strip()
            
            if cat_name.lower() != "outros" and len(cat_name) > 2:
                pattern = r'\b' + re.escape(cat_name.lower()) + r'\b'
                if re.search(pattern, text_lower):
                    data["category"] = cat_name
                    logger.info(f"Pós-processamento forçou a categoria exata: {cat_name}")
                    break
        
        logger.info(f"IA processou com sucesso: {data.get('name')} - R$ {data.get('amount')}")
        return ParsedExpense(**data)

    except json.JSONDecodeError as e:
        logger.error(f"Erro ao decodificar JSON da IA: {str(e)}")
        return _get_error_response("Erro de formato na resposta da IA")
        
    except Exception as e:
        logger.error(f"Erro inesperado no serviço de IA: {type(e).__name__} - {str(e)}")
        return _get_error_response("Falha na comunicação com o serviço de IA")

def _get_error_response(message: str) -> ParsedExpense:
    """Retorna um objeto padrão em caso de erro."""
    return ParsedExpense(
        name=message, 
        amount=0, 
        category="Erro", 
        type="Saída", 
        confidence=0
    )

async def transcribe_audio_url(audio_url: str) -> str:
    """
    Baixa um arquivo de áudio a partir de uma URL e faz a transcrição usando o Groq Whisper.
    Suporta autenticação básica do Twilio caso as chaves estejam no environment.
    """
    import httpx
    import os
    try:
        logger.info(f"Iniciando download do áudio: {audio_url}")
        
        # Suporte opcional a autenticação para URLs privadas do Twilio
        auth = None
        twilio_sid = os.getenv("TWILIO_ACCOUNT_SID") or os.getenv("Twilio__AccountSID")
        twilio_token = os.getenv("TWILIO_AUTH_TOKEN") or os.getenv("Twilio__AuthToken")
        if twilio_sid and twilio_token and "twilio.com" in audio_url:
            auth = (twilio_sid, twilio_token)
            
        async with httpx.AsyncClient(timeout=30.0, follow_redirects=True) as http_client:
            response = await http_client.get(audio_url, auth=auth)
            response.raise_for_status()
            audio_bytes = response.content

        # Determina a extensão ou usa .ogg como padrão do WhatsApp
        filename = "voice.ogg"
        url_lower = audio_url.lower()
        if ".mp3" in url_lower:
            filename = "voice.mp3"
        elif ".wav" in url_lower:
            filename = "voice.wav"
        elif ".m4a" in url_lower:
            filename = "voice.m4a"

        logger.info(f"Enviando {len(audio_bytes)} bytes de áudio para o modelo Whisper no Groq...")
        
        # Usando a API de transcrição do cliente OpenAI/Groq assíncrono
        transcription = await client.audio.transcriptions.create(
            file=(filename, audio_bytes),
            model="whisper-large-v3",
            response_format="text"
        )
        return transcription.strip()
    except Exception as e:
        logger.error(f"Erro ao transcrever arquivo de áudio: {type(e).__name__} - {str(e)}")
        raise