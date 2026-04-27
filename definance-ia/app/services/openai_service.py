import json
from openai import OpenAI
from app.schemas.expense_schema import ParsedExpense
from app.core.config import settings
from app.core.logging import logger
from typing import List

# Inicializa o cliente usando as configurações centralizadas
client = OpenAI(
    api_key=settings.OPENAI_API_KEY,
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
    Você é um assistente financeiro especializado em extrair dados de GASTOS (Saídas).
    Seu objetivo é transformar frases informais em dados estruturados (JSON).

    Regras:
    1. Extraia o NOME, VALOR e a CATEGORIA do gasto mencionado.
    2. Mesmo que a frase pareça um ganho (ex: 'recebi'), trate como um registro de valor para a categoria 'Outros' ou similar.
    3. O valor deve ser um número float.
    4. Identifique se o usuário mencionou 'hoje' ou 'ontem'.
    
    CATEGORIAS DISPONÍVEIS:
    [{categories_str}]
    
    5. Escolha a categoria MAIS ADEQUADA apenas entre as CATEGORIAS DISPONÍVEIS acima. 
    6. Se nenhuma categoria servir, use 'Outros'.
    
    7. Retorne APENAS o JSON no formato abaixo:
    {{
      "name": "Nome corrigido",
      "amount": 0.0,
      "category": "Categoria escolhida",
      "type": "Saída",
      "date": "hoje/ontem",
      "confidence": 0.95
    }}
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
        
        response = client.chat.completions.create(
            model=settings.MODEL_NAME,
            messages=[
                {"role": "system", "content": get_system_prompt(categories)},
                {"role": "user", "content": text}
            ],
            temperature=0,
            response_format={ "type": "json_object" }
        )
        
        content = response.choices[0].message.content
        data = json.loads(content)
        
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