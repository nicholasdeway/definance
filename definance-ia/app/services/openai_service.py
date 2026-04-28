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
    Você é um assistente financeiro especializado em extrair dados de movimentações financeiras (Entradas e Saídas).
    Seu objetivo é transformar frases informais em dados estruturados (JSON).

    Regras:
    1. Extraia o NOME, VALOR e a CATEGORIA mencionado.
    2. Identifique se é uma 'Entrada' (recebimento, ganho, salário, venda) ou 'Saída' (gasto, compra, pagamento).
    3. O valor deve ser um número float.
    4. Identifique se o usuário mencionou 'hoje' ou 'ontem'.
    
    CATEGORIAS DISPONÍVEIS:
    [{categories_str}]
    
    5. Cada categoria na lista acima pode conter palavras-chave entre parênteses. 
    6. Priorize SEMPRE uma categoria cujo NOME ou uma das PALAVRAS-CHAVE entre parênteses seja igual ou muito próxima ao item mencionado (ex: se o item é 'Steam' e existe a categoria 'Jogos (steam)', use 'Jogos').
    7. Se não houver correspondência clara por nome ou palavra-chave, escolha a categoria MAIS ADEQUADA semanticamente entre as disponíveis.
    8. IMPORTANTE: No campo "category" do JSON, retorne APENAS o NOME da categoria, sem as palavras-chave entre parênteses.
    9. Se nenhuma categoria da lista servir de forma alguma, use 'Outros'.
    
    10. Retorne APENAS o JSON no formato abaixo:
    {{
      "name": "Nome corrigido",
      "amount": 0.0,
      "category": "Nome da Categoria",
      "type": "Entrada" ou "Saída",
      "date": "hoje/ontem",
      "confidence": 0.95
    }}

    11. IMPORTANTE: Formate o NOME de maneira legível em PORTUGUÊS, garantindo que a primeira letra seja maiúscula. Corrija a ortografia e adicione acentos se necessário (ex: 'cafe' vira 'Café', 'almoco' vira 'Almoço', 'pao' vira 'Pão', 'agua' vira 'Água'). Preserve nomes de marcas/empresas (ex: 'Steam', 'Uber').
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
        
        # Garante que o nome comece com letra maiúscula
        if "name" in data and data["name"]:
            data["name"] = data["name"][0].upper() + data["name"][1:]
        
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