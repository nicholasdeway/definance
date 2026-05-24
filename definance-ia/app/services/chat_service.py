import json
import httpx
import datetime
from typing import Dict, List, Union, Any
from app.core.config import settings
from app.core.logging import logger
from openai import AsyncOpenAI
from openai.types.chat import ChatCompletionMessageParam, ChatCompletionToolParam, ChatCompletionMessageToolCall

# Inicializa o cliente OpenAI/Groq assíncrono reusando as chaves de configuração
client = AsyncOpenAI(
    api_key=settings.GROQ_API_KEY,
    base_url=settings.GROQ_BASE_URL
)

conversation_histories: Dict[str, List[ChatCompletionMessageParam]] = {}

SYSTEM_PROMPT = """
# Regra de Ouro (CRÍTICA - OBRIGATÓRIA)
Você NUNCA deve chamar as ferramentas `registrar_conta` ou `registrar_movimentacao` sem que o usuário tenha fornecido explicitamente o VALOR (ex: 200,00) e o VENCIMENTO (ex: todo dia 5, ou dia 20). NUNCA use valores de exemplo do prompt ou valores alucinados/inventados. Se qualquer uma dessas duas informações (valor ou vencimento) estiver faltando, pare imediatamente e pergunte ao usuário de forma amigável para completá-las.

# 1. Persona e objetivo
Você é o assistente financeiro virtual do Definance no WhatsApp.
Seu objetivo: ajudar o usuário a controlar suas finanças de forma amigável, clara e concisa.
Nome do usuário: {user_name}

# 2. Fluxo de conversação e tato financeiro (OBRIGATÓRIO)
- Nunca chame ferramentas de registro se faltarem dados essenciais (vencimento, valor, categoria, etc.).
- Cada nova transação é independente: não reutilize vencimento, valor ou status de lançamentos anteriores, a menos que o usuário peça explicitamente.
- Nunca alucine dados obrigatórios (valor, vencimento, etc.). Se o usuário disser "adicione meu curso de inglês" ou "adicione uma conta fixa de internet" sem especificar o valor e o vencimento (ou dia de vencimento), você NÃO deve chamar a ferramenta. Você DEVE perguntar por esses dados ausentes primeiro.
- Para contas fixas ou recorrentes (ex: "curso de inglês", "academia", "aluguel"): exija sempre que o usuário informe o valor e o dia de vencimento (ex: "vencimento todo dia 5"). Não tente registrar a conta com dados inventados.
- Recorrência: contas de consumo (água, aluguel, internet, etc.) são presumivelmente recorrentes. Pergunte se deseja cadastrar como recorrente (mensal).
- Pergunte em lote: sempre que faltarem mais de um dado essencial, reúna‑os em uma única frase.
  Exemplo: “Nicholas, qual o vencimento dessa conta de internet de R$ 129,90? Está paga ou pendente? Deseja cadastrar como recorrente (mensal)?”

# 3. Comunicação
- Fale em português do Brasil, de forma humanizada, simpática e direta.
- Use no máximo um emoji por mensagem (geralmente no final da confirmação de registro).
- Evite gírias excessivas e linguagem muito formal; mantenha um tom de “amigo que entende de finanças”.

# 4. Formatação de mensagens (OBRIGATÓRIO para WhatsApp)
- Use asterisco simples (*texto*) para negrito.
  ✅ Correto: *Valor:* R$ 40,00 | *Categoria:* Alimentação
  ❌ Incorreto: **Valor:** R$ 40,00 || Categoria: Alimentação
- Nunca use asterisco duplo, sublinhado ou travessão para negrito.
- Separe campos com “ | ” (espaço, pipe, espaço) quando houver mais de um item na mesma linha.

# 5. Categorias disponíveis
{categorias_disponiveis}
- Ao registrar, use exatamente o nome da categoria (sem colchetes nem tipo).
- Se a categoria sugerida não existir, pergunte ao usuário qual categoria deseja usar ou sugira “Outros”.

# 6. Regras de negócio
6.1 Movimentação já realizada
- Use `registrar_movimentacao` apenas quando o usuário confirmar que o lançamento já aconteceu (ex: “paguei”, “recebi”).

6.2 Conta a pagar (futura/pendente)
- Use `registrar_conta` para vencimentos futuros ou pendentes. Status padrão: “Pendente”.
- Se o usuário solicitar o registro de uma conta fixa/recorrente (ex: "conta fixa", "recorrente todo mês"), certifique-se de passar `recorrente=True` e o `dia_vencimento` correspondente (ex: dia 5 -> `dia_vencimento=5`). A data de vencimento (`data_vencimento`) da primeira ocorrência deve ser resolvida com base no mês/ano de referência seguindo a regra 6.8.

6.3 Solicitação de relatório / resumo
- Se o usuário pedir “relatório”, “resumo”, “saldo”, “entradas e saídas” ou similar, chame diretamente a ferramenta `obter_resumo_financeiro`. Não há necessidade de perguntar antes se ele quer o resumo geral.
- Se o usuário perguntar especificamente sobre contas a pagar, pendentes ou atrasadas (ex: "quais contas tenho a pagar?"), chame a ferramenta `listar_contas`.

6.4 Formato obrigatório para `obter_resumo_financeiro`
Nicholas, aqui está o resumo financeiro para o período solicitado:

*Total de Receitas:* R$ [totalReceitas]
*Total de Despesas:* R$ [totalDespesas]
*Saldo:* R$ [saldoFinal]   (se negativo, mostre o sinal de menos, ex: -R$ 40,00)

*Detalhamento de Entradas (Receitas):*
- [receita]: R$ [valor]   (liste todos os itens de analiseReceitas)

*Detalhamento de Despesas por Categoria:*
- [categoria]: R$ [valor]   (liste todos os itens de analiseCategorias)

[Se contasPendentes > 0] Você tem [X] conta(s) pendente(s) em aberto.

6.5 Histórico de transações / extrato
- Se o usuário pedir “histórico”, “extrato”, “últimas movimentações” ou similar, chame `listar_ultimas_movimentacoes` (passando tipo = “Entrada”, “Saida” ou “Todas” conforme a solicitação).
- Apresente os lançamentos ordenados por data (decrescente), cada linha no formato:
  * [DD/MM/YYYY] [Tipo] – [Nome] – R$ [Valor]

6.6 Consulta de contas a pagar
- Para perguntas genéricas sobre contas pendentes, chame `listar_contas` sem filtros.
- Se o usuário especificar mês/ano, repasse esses parâmetros.
- Formato obrigatório de retorno:
  Nicholas, você tem [X] contas em aberto:
  * [Nome] no valor de R$ [Valor], com vencimento em [DD/MM/YYYY], [Status].
- Se a lista estiver vazia (`[]`), responda: “Nicholas, você não tem contas em aberto no momento.”

6.7 Fluxo de pagamento / baixa de conta (OBRIGATÓRIO)
1. Liste as contas com `listar_contas` (filtrando por nome se o usuário mencionar).
2. Se encontrar exatamente uma conta pendente com aquele nome, confirme:
   “Nicholas, encontrei a conta de [Nome] de R$ [Valor] com vencimento em [DD/MM/YYYY]. Deseja que eu dê baixa nela agora?”
3. Aguarde confirmação explícita (“sim”, “pagar”, “quer pagar”, etc.). Só então chame `pagar_conta` com o `conta_id` obtido.
4. Se não houver correspondência ou houver mais de uma conta com o mesmo nome, peça ao usuário que especifique mais detalhes (ex: vencimento, valor) para desambiguar.
5. Se a conta não estiver pendente, info: “Nicholas, não encontrei nenhuma conta de [Nome] pendente em aberto para dar baixa.”

6.8 Tratamento de datas
- Quando o usuário mencionar um dia numérico (ex: “dia 30”, “15”), cruze esse número com a data de referência `{today_date}` para determinar o mês/ano correto.
- Se o dia já passou neste mês, considere o mês seguinte (exceto se o usuário explicitamente disser “mês passado”).
- Sempre converta a data final para o formato ISO‑8601 `YYYY-MM-DD` antes de enviar ao backend.

6.9 Evitar confusão de templates
- O modelo de Confirmação de Registro (seção 6.10) deve ser usado **apenas** após um novo registro (movimentação, conta ou entrada) que você acabou de cadastrar na conversa atual.
- NÃO use esse modelo para listar transações existentes, resumos, históricos ou qualquer outro tipo de consulta.
- NUNCA envie textos explicativos, confirmações ou mensagens de sucesso junto com a chamada de ferramenta. Faça a chamada de ferramenta e aguarde o retorno do sistema para então gerar a mensagem de confirmação no turno seguinte.

6.10 Confirmação de registro (OBRIGATÓRIO)
Após um registro bem‑sucedido, responda exatamente no formato abaixo, sem saudações ou textos adicionais após o rodapé:

[Despesa/Entrada/Conta/Conta Fixa] no [Nome] registrada com sucesso! 📊💸
*Valor:* R$ [Valor]
*Categoria:* [Categoria]   (Omitir para Entrada)
*Descrição:* [Nome]
*Status:* [Status]   (Pago/Pendente)
*Data [ou Data de Vencimento]:* [DD/MM/YYYY]

- Para o cabeçalho, use "Conta Fixa" se a conta registrada for recorrente (recorrente=True). Ex: "Conta Fixa no Curso de Inglês registrada com sucesso! 📊💸"

6.11 Data de referência
Hoje é `{today_date}` (dia da semana: `{weekday}`). Use essa informação para resolver datas relativas (ontem, amanhã, próxima segunda, etc.).

6.12 Tratamento de erros
- Se o backend ou alguma ferramenta (tool) retornar um JSON contendo a chave `"erro"`, não ignore o erro e NÃO use nenhum template de sucesso. Responda informando que ocorreu uma instabilidade e peça para tentar novamente em instantes.
- Retornos vazios (`[]`) não são erro; trate-os como “nenhum resultado encontrado” e informe ao usuário de forma amistosa.
- Nunca exponha stack traces ou detalhes técnicos ao usuário final.

6.13 Limite de iterações
- No máximo 5 chamadas de ferramentas por turno de conversa. Se o limite for atingido, responda:
  “O processamento da sua solicitação está tomando mais tempo do que o esperado. Pode simplificar o pedido ou tentar novamente em alguns instantes?”

6.14 Metas de Economia (Goals)
- Se o usuário perguntar sobre suas metas de economia, objetivos ou quanto economizou (ex: "quais minhas metas?"), chame `listar_metas`.
- Formato obrigatório de retorno para `listar_metas`:
  Nicholas, aqui estão suas metas de economia:
  * [name]: R$ [currentAmount] de R$ [targetAmount] (Falta R$ [restante]) | Progresso: [progresso]% | Categoria: [category]
  - Se a lista de metas estiver vazia (`[]`), responda: “Nicholas, você não tem nenhuma meta de economia cadastrada no momento.”
- Se o usuário quiser guardar, depositar ou salvar dinheiro em uma meta (ex: "guardar R$ 100 na meta Europa"):
  1. Chame diretamente a ferramenta `depositar_meta` informando o `meta_nome` (ex: "Europa") e o `valor` (ex: 100.00). Não tente buscar o ID primeiro via `listar_metas` a menos que seja estritamente necessário.
  2. NUNCA tente inventar ou alucinar o `meta_id` (GUID). Se você não souber o ID exato, passe apenas o `meta_nome` e a ferramenta em Python fará a busca inteligente e resolução do ID para você.
  3. Formato obrigatório de retorno após depósito bem-sucedido:
     Depósito de R$ [Valor] realizado com sucesso na meta [name]! 📊💸
     *Novo Saldo da Meta:* R$ [currentAmount] de R$ [targetAmount]
     *Status:* [Concluída/Em Andamento]
  4. Se houver duplicidade de metas com nomes parecidos, o backend retornará um erro e você deve pedir clarificação.

# 7. Exemplos (few‑shot)
Exemplo 1 – Registro de despesa:
Usuário: “Paguei o Uber hoje, R$ 23,50.”
Assistente:
*Despesa* no Uber registrada com sucesso! 📊💸
*Valor:* R$ 23,50
*Categoria:* Transporte
*Descrição:* Uber
*Status:* Pago
*Data:* 02/11/2025

Exemplo 2 – Pedido de resumo genérico:
Usuário: “Me dá um resumo das minhas finanças.”
Assistente:
Nicholas, você gostaria de um Resumo Geral (entradas e saídas), Contas a pagar, Contas atrasadas/pendentes, Entradas (Receitas) ou Saídas (Despesas)?

Exemplo 3 – Pagamento de conta:
Usuário: “Quero pagar a conta de luz.”
Assistente: Nicholas, encontrei a conta de Luz de R$ 120,00 com vencimento em 10/11/2025. Deseja que eu dê baixa nela agora?
Usuário: sim
Assistente:
Conta de Luz paga com sucesso! 📊💸
*Valor:* R$ 120,00
*Categoria:* Serviços
*Descrição:* Luz
*Status:* Pago
*Data de pagamento:* 02/11/2025

Exemplo 4 – Guardar dinheiro em uma meta:
Usuário: “Quero guardar R$ 150 na meta Carro Novo.”
Assistente: Depósito de R$ 150,00 realizado com sucesso na meta Carro Novo! 📊💸
*Novo Saldo da Meta:* R$ 1.500,00 de R$ 30.000,00
*Status:* Em Andamento
"""

tools: List[ChatCompletionToolParam] = [
    {
        "type": "function",
        "function": {
            "name": "obter_resumo_financeiro",
            "description": "Obtém o resumo/análise financeira do usuário para um determinado mês e ano.",
            "parameters": {
                "type": "object",
                "properties": {
                    "mes": {
                        "type": "integer",
                        "description": "O número do mês (1 a 12). Ex: 5. Se não fornecido, o backend usará o mês atual."
                    },
                    "ano": {
                        "type": "integer",
                        "description": "O ano de quatro dígitos (ex: 2026). Se não fornecido, o backend usará o ano atual."
                    }
                }
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "registrar_movimentacao",
            "description": "Registra uma nova movimentação financeira (receita/entrada ou despesa/saída) para o usuário.",
            "parameters": {
                "type": "object",
                "properties": {
                    "tipo": {
                        "type": "string",
                        "enum": ["Entrada", "Saida"],
                        "description": "O tipo da movimentação: 'Entrada' para receitas/recebimentos e 'Saida' para despesas/gastos."
                    },
                    "nome": {
                        "type": "string",
                        "description": "O nome descritivo da movimentação (ex: 'Salário', 'Uber', 'Almoço')."
                    },
                    "valor": {
                        "type": "number",
                        "description": "O valor monetário positivo da movimentação (ex: 42.50)."
                    },
                    "categoria": {
                        "type": "string",
                        "description": "A categoria da movimentação. Obrigatório apenas para 'Saída' (ex: 'Alimentação', 'Transporte', 'Lazer'). Para 'Entrada', este campo é ignorado."
                    },
                    "data": {
                        "type": "string",
                        "description": "Opcional. A data do registro no formato ISO-8601 YYYY-MM-DD. IMPORTANTE: Só preencha se o usuário especificar uma data diferente de hoje (ex: 'ontem', 'dia 15', 'segunda'). Se for hoje ou não especificado, NÃO envie este campo (deixe-o vazio)."
                    },
                    "status": {
                        "type": "string",
                        "enum": ["Pago", "Pendente"],
                        "description": "O status de pagamento da movimentação. Padrão: 'Pago'. Apenas aplicável para 'Saída'."
                    },
                    "recorrente": {
                        "type": "boolean",
                        "description": "Opcional. Indica se esta movimentação de receita/entrada (como salário) é recorrente. Padrão: false."
                    }
                },
                "required": ["tipo", "nome", "valor"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "listar_categorias",
            "description": "Lista todas as categorias de despesas cadastradas no sistema.",
            "parameters": {
                "type": "object",
                "properties": {}
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "listar_ultimas_movimentacoes",
            "description": "Lista as transações mais recentes (entradas, saídas ou ambas) registradas pelo usuário.",
            "parameters": {
                "type": "object",
                "properties": {
                    "tipo": {
                        "type": "string",
                        "enum": ["Entrada", "Saida", "Todas"],
                        "description": "O tipo de movimentação a ser listada. Padrão: 'Todas'."
                    },
                    "limite": {
                        "type": "integer",
                        "description": "A quantidade máxima de transações a retornar. Padrão: 5."
                    }
                }
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "registrar_conta",
            "description": "Cadastra uma nova conta a pagar (Minhas Contas / Bill) no sistema (geralmente com vencimento futuro).",
            "parameters": {
                "type": "object",
                "properties": {
                    "nome": {
                        "type": "string",
                        "description": "O nome descritivo da conta (ex: 'Conta de Luz', 'Internet')."
                    },
                    "valor": {
                        "type": "number",
                        "description": "O valor da conta (ex: 350.00)."
                    },
                    "categoria": {
                        "type": "string",
                        "description": "A categoria da conta (ex: 'Habitação', 'Serviços')."
                    },
                    "data_vencimento": {
                        "type": "string",
                        "description": "A data de vencimento no formato ISO-8601 YYYY-MM-DD."
                    },
                    "status": {
                        "type": "string",
                        "enum": ["Pendente", "Pago"],
                        "description": "O status da conta. Padrão: 'Pendente'."
                    },
                    "recorrente": {
                        "type": "boolean",
                        "description": "Opcional. Indica se esta conta é recorrente (mensal, fixa, etc.), como conta de água, luz, aluguel, internet. Padrão: false."
                    },
                    "dia_vencimento": {
                        "type": "integer",
                        "description": "Opcional. O dia do mês em que a conta vence (1 a 31). Recomenda-se preencher se o usuário indicar um dia de vencimento recorrente (ex: 'todo dia 5' -> 5)."
                    }
                },
                "required": ["nome", "valor", "data_vencimento"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "listar_contas",
            "description": "Lista as contas a pagar (Minhas Contas / Bills) cadastradas para o usuário. Deixe mes e ano vazios para listar todas as contas de todos os períodos.",
            "parameters": {
                "type": "object",
                "properties": {
                    "mes": {
                        "type": "integer",
                        "description": "Opcional. O número do mês (1 a 12) para filtrar as contas."
                    },
                    "ano": {
                        "type": "integer",
                        "description": "Opcional. O ano de quatro dígitos (ex: 2026) para filtrar as contas."
                    }
                }
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "pagar_conta",
            "description": "Registra o pagamento de uma conta a pagar pendente (Minhas Contas / Bill) pelo ID da conta.",
            "parameters": {
                "type": "object",
                "properties": {
                    "conta_id": {
                        "type": "string",
                        "description": "O ID (GUID) da conta a ser paga. Obtenha listando as contas antes se necessário."
                    },
                    "data_pagamento": {
                        "type": "string",
                        "description": "A data do pagamento no formato YYYY-MM-DD. Se não fornecida, assume-se a data de hoje."
                    }
                },
                "required": ["conta_id"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "listar_metas",
            "description": "Lista todas as metas de economia (Goals) cadastradas pelo usuário.",
            "parameters": {
                "type": "object",
                "properties": {}
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "depositar_meta",
            "description": "Deposita/guarda um valor financeiro em uma meta de economia específica por meio de seu nome ou ID.",
            "parameters": {
                "type": "object",
                "properties": {
                    "meta_nome": {
                        "type": "string",
                        "description": "O nome da meta (ou parte dele) no qual o valor será depositado (ex: 'Europa', 'Viagem Europa')."
                    },
                    "meta_id": {
                        "type": "string",
                        "description": "Opcional. O ID (GUID) da meta na qual o valor será depositado, se souber."
                    },
                    "valor": {
                        "type": "number",
                        "description": "O valor a ser guardado/depositado na meta (ex: 50.00)."
                    }
                },
                "required": ["valor"]
            }
        }
    }
]

import re

def _sanitize_date(date_str: str | None) -> str:
    """
    Corrige o ano de uma string de data (YYYY-MM-DD ou YYYY-MM-DDTHH:MM:SS) caso a IA 
    tenha alucinado um ano passado (como 2023, 2024 ou 2025) quando o sistema está em 2026.
    """
    if not date_str:
        return datetime.datetime.now().strftime("%Y-%m-%dT%H:%M:%S")
        
    current_year = datetime.date.today().year
    
    # Se a string começar com um ano de 4 dígitos
    match = re.match(r"^(\d{4})-(.*)$", date_str)
    if match:
        gen_year = int(match.group(1))
        # Se o ano gerado for menor que o ano atual, corrige para o ano atual
        if gen_year < current_year:
            corrected_date = f"{current_year}-{match.group(2)}"
            logger.info(f"Data corrigida de '{date_str}' para '{corrected_date}' (ano alucinado pela IA: {gen_year})")
            return corrected_date
            
    return date_str

async def _resolve_category(sugestao: str | None, headers: dict) -> str:
    """
    Busca as categorias reais do backend e encontra a melhor correspondência
    para a sugestão da IA, garantindo que o nome enviado ao banco seja exato.
    """
    if not sugestao:
        return "Outros"
    
    try:
        async with httpx.AsyncClient(timeout=30.0) as http:
            resp = await http.get(f"{settings.BACKEND_URL}/api/Categories", headers=headers)
            if resp.status_code != 200:
                return sugestao
            
            categories: list = resp.json()
            # categories pode ser uma lista de strings ou de objetos com campo 'name'
            cat_names = []
            for c in categories:
                if isinstance(c, str):
                    cat_names.append(c)
                elif isinstance(c, dict):
                    cat_names.append(c.get("name") or c.get("Name") or "")
            cat_names = [c for c in cat_names if c]
    except Exception as e:
        logger.warning(f"Não foi possível buscar categorias para resolver sugestão: {e}")
        return sugestao
    
    sugestao_lower = sugestao.lower().strip()
    
    # Passo 1: correspondência exata (case-insensitive)
    for cat in cat_names:
        if cat.lower().strip() == sugestao_lower:
            logger.info(f"Categoria resolvida (exata): '{sugestao}' -> '{cat}'")
            return cat
    
    # Passo 2: palavra inteira encontrada no nome da sugestão ou vice-versa
    for cat in cat_names:
        cat_lower = cat.lower().strip()
        if cat_lower == "outros":
            continue
        pattern = r'\b' + re.escape(cat_lower) + r'\b'
        if re.search(pattern, sugestao_lower) or re.search(r'\b' + re.escape(sugestao_lower) + r'\b', cat_lower):
            logger.info(f"Categoria resolvida (palavra): '{sugestao}' -> '{cat}'")
            return cat
    
    # Passo 3: substring
    for cat in cat_names:
        cat_lower = cat.lower().strip()
        if cat_lower == "outros":
            continue
        if cat_lower in sugestao_lower or sugestao_lower in cat_lower:
            logger.info(f"Categoria resolvida (substring): '{sugestao}' -> '{cat}'")
            return cat
    
    logger.info(f"Categoria sem correspondência, mantendo sugestão da IA: '{sugestao}'")
    return sugestao

async def execute_tool(name: str, args: dict | None, headers: dict) -> Union[dict, list]:
    if not isinstance(args, dict):
        args = {}
    try:
        async with httpx.AsyncClient(timeout=30.0) as http_client:
            if name == "obter_resumo_financeiro":
                mes = args.get("mes")
                ano = args.get("ano")
                
                # Conversão segura para inteiro para o backend
                if mes is not None:
                    try:
                        mes = int(mes)
                    except (ValueError, TypeError):
                        pass
                if ano is not None:
                    try:
                        ano = int(ano)
                    except (ValueError, TypeError):
                        pass
                        
                params = {}
                if mes:
                    params["month"] = mes
                if ano:
                    params["year"] = ano
                
                url = f"{settings.BACKEND_URL}/api/Analysis"
                logger.info(f"Executando obter_resumo_financeiro: GET {url} params={params}")
                resp = await http_client.get(url, params=params, headers=headers)
                
                if resp.status_code == 200:
                    data = resp.json()
                    compacted = {
                        "totalReceitas": data.get("totalReceitas") or data.get("TotalReceitas") or 0.0,
                        "totalDespesas": data.get("totalDespesas") or data.get("TotalDespesas") or 0.0,
                        "totalAtrasadas": data.get("totalAtrasadas") or data.get("TotalAtrasadas") or 0.0,
                        "contasPendentes": data.get("contasPendentes") or data.get("ContasPendentes") or 0,
                        "saldoFinal": data.get("saldoFinal") or data.get("SaldoFinal") or 0.0,
                    }
                    
                    cats_source = data.get("categoryAnalysis") or data.get("CategoryAnalysis") or []
                    cats_clean = []
                    for c in cats_source:
                        cat_name = c.get("categoria") or c.get("Categoria") or ""
                        amount = c.get("valor") or c.get("Valor") or 0.0
                        if cat_name:
                            cats_clean.append({"categoria": cat_name, "valor": amount})
                    compacted["analiseCategorias"] = cats_clean
                    
                    inc_source = data.get("incomeAnalysis") or data.get("IncomeAnalysis") or []
                    inc_clean = []
                    for i in inc_source:
                        inc_name = i.get("tipo") or i.get("Tipo") or ""
                        amount = i.get("valor") or i.get("Valor") or 0.0
                        if inc_name:
                            inc_clean.append({"receita": inc_name, "valor": amount})
                    compacted["analiseReceitas"] = inc_clean
                    
                    return compacted
                else:
                    logger.error(f"Erro em obter_resumo_financeiro (status={resp.status_code}): {resp.text}")
                    return {"erro": f"Erro do servidor backend (status {resp.status_code})"}
                    
            elif name == "registrar_movimentacao":
                tipo = args.get("tipo")
                nome = args.get("nome")
                valor = args.get("valor")
                
                # Conversão segura para float
                if valor is not None:
                    try:
                        valor = float(valor)
                    except (ValueError, TypeError):
                        pass
                        
                categoria = args.get("categoria")
                data = args.get("data")
                status = args.get("status", "Pago")
                is_recurring = args.get("recorrente", False)
                
                # Resolve a categoria contra as categorias reais do backend
                categoria = await _resolve_category(categoria, headers)
                
                # Sanitiza e corrige o ano se necessário
                data = _sanitize_date(data)
                
                if len(data) == 10:
                    # A IA enviou apenas a data (YYYY-MM-DD) sem hora — combina com a hora atual
                    data = f"{data}T{datetime.datetime.now().strftime('%H:%M:%S')}"
                
                if tipo == "Entrada":
                    url = f"{settings.BACKEND_URL}/api/Incomes"
                    payload = {
                        "name": nome,
                        "amount": valor,
                        "type": "Variável",
                        "date": data,
                        "isRecurring": is_recurring
                    }
                    logger.info(f"Executando registrar_movimentacao (Entrada): POST {url} payload={payload}")
                    resp = await http_client.post(url, json=payload, headers=headers)
                else:
                    url = f"{settings.BACKEND_URL}/api/Expenses"
                    payload = {
                        "name": nome,
                        "amount": valor,
                        "category": categoria or "Outros",
                        "date": data,
                        "expenseType": "Variável",
                        "status": status,
                        "description": "Registrado via WhatsApp"
                    }
                    logger.info(f"Executando registrar_movimentacao (Saída): POST {url} payload={payload}")
                    resp = await http_client.post(url, json=payload, headers=headers)
                    
                if resp.status_code in (200, 201):
                    return {"sucesso": True, "dados": resp.json()}
                elif resp.status_code == 400:
                    logger.error(f"Bad Request em registrar_movimentacao: {resp.text}")
                    return {"erro": "Dados inválidos fornecidos para o registro.", "detalhes": resp.json()}
                else:
                    logger.error(f"Erro em registrar_movimentacao (status={resp.status_code}): {resp.text}")
                    return {"erro": f"Erro ao registrar no backend (status {resp.status_code})"}
                    
            elif name == "listar_categorias":
                url = f"{settings.BACKEND_URL}/api/Categories"
                logger.info(f"Executando listar_categorias: GET {url}")
                resp = await http_client.get(url, headers=headers)
                if resp.status_code == 200:
                    return resp.json()
                else:
                    logger.error(f"Erro em listar_categorias (status={resp.status_code}): {resp.text}")
                    return {"erro": f"Erro do servidor backend (status {resp.status_code})"}
                    
            elif name == "listar_ultimas_movimentacoes":
                tipo = args.get("tipo", "Todas")
                limite = args.get("limite", 5)
                
                # Conversão segura para inteiro
                if limite is not None:
                    try:
                        limite = int(limite)
                    except (ValueError, TypeError):
                        limite = 5
                        
                incomes = []
                expenses = []
                
                if tipo in ("Entrada", "Todas"):
                    url = f"{settings.BACKEND_URL}/api/Incomes"
                    resp = await http_client.get(url, headers=headers)
                    if resp.status_code == 200:
                        incomes = resp.json()
                        
                if tipo in ("Saida", "Todas"):
                    url = f"{settings.BACKEND_URL}/api/Expenses"
                    resp = await http_client.get(url, headers=headers)
                    if resp.status_code == 200:
                        expenses = resp.json()
                
                combined = []
                for inc in incomes:
                    combined.append({
                        "id": inc.get("id"),
                        "nome": inc.get("name"),
                        "valor": inc.get("amount"),
                        "tipo": "Entrada",
                        "categoria": "Receita",
                        "data": inc.get("date")
                    })
                for exp in expenses:
                    combined.append({
                        "id": exp.get("id"),
                        "nome": exp.get("name"),
                        "valor": exp.get("amount"),
                        "tipo": "Saída",
                        "categoria": exp.get("category"),
                        "data": exp.get("date"),
                        "status": exp.get("status")
                    })
                
                # Ordena pela data de forma decrescente
                combined.sort(key=lambda x: x.get("data", ""), reverse=True)
                return combined[:limite]
                
            elif name == "registrar_conta":
                nome = args.get("nome")
                valor = args.get("valor")
                categoria = args.get("categoria", "Outros")
                data_vencimento = args.get("data_vencimento")
                status = args.get("status", "Pendente")
                is_recurring = args.get("recorrente", False)
                dia_vencimento = args.get("dia_vencimento")
                
                # Sanitiza e corrige o ano se necessário
                data_vencimento = _sanitize_date(data_vencimento)
                
                # Resolve a categoria contra as categorias reais do backend
                categoria = await _resolve_category(categoria, headers)
                
                if valor is not None:
                    try:
                        valor = float(valor)
                    except (ValueError, TypeError):
                        pass
                        
                # Resolve o dia do vencimento
                if dia_vencimento is not None:
                    try:
                        dia_vencimento = int(dia_vencimento)
                    except (ValueError, TypeError):
                        dia_vencimento = None
                
                # Fallback: extrai o dia a partir de data_vencimento caso não tenha sido explicitamente enviado
                if dia_vencimento is None and data_vencimento:
                    try:
                        date_part = data_vencimento.split("T")[0]
                        dia_vencimento = int(date_part.split("-")[2])
                    except Exception:
                        pass

                # Se a conta for recorrente, pendente e o vencimento já passou neste mês, avançamos para o mês seguinte
                if is_recurring and status == "Pendente" and data_vencimento:
                    try:
                        date_parts = data_vencimento.split("T")[0].split("-")
                        year = int(date_parts[0])
                        month = int(date_parts[1])
                        day = int(date_parts[2])
                        
                        dueDateObj = datetime.date(year, month, day)
                        todayObj = datetime.date.today()
                        
                        if dueDateObj <= todayObj:
                            if month == 12:
                                next_month = 1
                                next_year = year + 1
                            else:
                                next_month = month + 1
                                next_year = year
                                
                            import calendar
                            last_day = calendar.monthrange(next_year, next_month)[1]
                            next_day = min(day, last_day)
                            
                            new_due_date = datetime.date(next_year, next_month, next_day)
                            data_vencimento = new_due_date.strftime("%Y-%m-%d")
                            dia_vencimento = next_day
                            logger.info(f"Ajustando data_vencimento de conta recorrente de '{dueDateObj}' para '{data_vencimento}' (pois o dia {day} já passou neste mês)")
                    except Exception as e:
                        logger.error(f"Erro ao auto-ajustar data de vencimento recorrente: {e}")
                
                url = f"{settings.BACKEND_URL}/api/Bills"
                payload = {
                    "name": nome,
                    "amount": valor,
                    "category": categoria,
                    "dueDate": data_vencimento,
                    "dueDay": dia_vencimento,
                    "status": status,
                    "isRecurring": is_recurring,
                    "billType": "Fixa" if is_recurring else "Variável",
                    "description": "Registrado via WhatsApp"
                }
                logger.info(f"Executando registrar_conta: POST {url} payload={payload}")
                resp = await http_client.post(url, json=payload, headers=headers)
                if resp.status_code in (200, 201):
                    return {"sucesso": True, "dados": resp.json()}
                else:
                    logger.error(f"Erro em registrar_conta (status={resp.status_code}): {resp.text}")
                    return {"erro": f"Erro ao registrar conta no backend (status {resp.status_code})"}
                    
            elif name == "listar_contas":
                mes = args.get("mes")
                ano = args.get("ano")
                
                if mes is not None:
                    try:
                        mes = int(mes)
                    except (ValueError, TypeError):
                        pass
                if ano is not None:
                    try:
                        ano = int(ano)
                    except (ValueError, TypeError):
                        pass
                        
                params = {}
                if mes:
                    params["month"] = mes
                if ano:
                    params["year"] = ano
                    
                url = f"{settings.BACKEND_URL}/api/Bills"
                logger.info(f"Executando listar_contas: GET {url} params={params}")
                resp = await http_client.get(url, params=params, headers=headers)
                if resp.status_code == 200:
                    return resp.json()
                else:
                    logger.error(f"Erro em listar_contas (status={resp.status_code}): {resp.text}")
                    return {"erro": f"Erro do servidor backend (status {resp.status_code})"}
                    
            elif name == "pagar_conta":
                conta_id = args.get("conta_id")
                data_pagamento = args.get("data_pagamento")
                
                # Sanitiza e corrige o ano se necessário
                data_pagamento = _sanitize_date(data_pagamento)
                    
                url = f"{settings.BACKEND_URL}/api/Bills/{conta_id}/pay"
                payload = {
                    "paymentDate": data_pagamento
                }
                logger.info(f"Executando pagar_conta: PUT {url} payload={payload}")
                resp = await http_client.put(url, json=payload, headers=headers)
                if resp.status_code == 200:
                    return {"sucesso": True, "dados": resp.json()}
                else:
                    logger.error(f"Erro em pagar_conta (status={resp.status_code}): {resp.text}")
                    return {"erro": f"Erro ao pagar conta no backend (status {resp.status_code})"}
                    
            elif name == "listar_metas":
                url = f"{settings.BACKEND_URL}/api/Goals"
                logger.info(f"Executando listar_metas: GET {url}")
                resp = await http_client.get(url, headers=headers)
                if resp.status_code == 200:
                    return resp.json()
                else:
                    logger.error(f"Erro em listar_metas (status={resp.status_code}): {resp.text}")
                    return {"erro": f"Erro do servidor backend (status {resp.status_code})"}
                    
            elif name == "depositar_meta":
                meta_id = args.get("meta_id")
                meta_nome = args.get("meta_nome")
                valor = args.get("valor")
                
                if valor is not None:
                    try:
                        valor = float(valor)
                    except (ValueError, TypeError):
                        pass
                
                # Se não temos o ID mas temos o nome da meta, resolvemos buscando a lista de metas
                if not meta_id and meta_nome:
                    try:
                        goals_url = f"{settings.BACKEND_URL}/api/Goals"
                        goals_resp = await http_client.get(goals_url, headers=headers)
                        if goals_resp.status_code == 200:
                            goals = goals_resp.json()
                            meta_nome_lower = meta_nome.lower().strip()
                            
                            # Tenta correspondência exata ou parcial inteligente
                            matched_goals = []
                            for g in goals:
                                g_name_lower = g.get("name", "").lower().strip()
                                if g_name_lower == meta_nome_lower:
                                    matched_goals = [g]
                                    break
                                elif meta_nome_lower in g_name_lower or g_name_lower in meta_nome_lower:
                                    matched_goals.append(g)
                            
                            if len(matched_goals) == 1:
                                meta_id = matched_goals[0]["id"]
                                logger.info(f"Meta resolvida pelo nome '{meta_nome}' -> '{matched_goals[0]['name']}' (ID: {meta_id})")
                            elif len(matched_goals) > 1:
                                names_str = ", ".join([g.get("name", "") for g in matched_goals])
                                return {"erro": f"Encontrei mais de uma meta com nomes semelhantes: {names_str}. Por favor, seja mais específico."}
                            else:
                                return {"erro": f"Não encontrei nenhuma meta correspondente ao nome '{meta_nome}'."}
                        else:
                            return {"erro": f"Não foi possível buscar as metas para resolver o nome '{meta_nome}' (status {goals_resp.status_code})."}
                    except Exception as e:
                        logger.error(f"Erro ao resolver meta pelo nome '{meta_nome}': {e}")
                        return {"erro": f"Erro interno ao buscar metas pelo nome."}
                
                if not meta_id:
                    return {"erro": "ID ou nome da meta não especificado."}
                
                url = f"{settings.BACKEND_URL}/api/Goals/{meta_id}/deposit"
                payload = {
                    "amount": valor
                }
                logger.info(f"Executando depositar_meta: PATCH {url} payload={payload}")
                resp = await http_client.patch(url, json=payload, headers=headers)
                if resp.status_code == 200:
                    return {"sucesso": True, "dados": resp.json()}
                else:
                    logger.error(f"Erro em depositar_meta (status={resp.status_code}): {resp.text}")
                    return {"erro": f"Erro ao depositar na meta no backend (status {resp.status_code})"}
                    
            else:
                return {"erro": f"Ferramenta '{name}' não encontrada."}
                
    except Exception as e:
        logger.error(f"Exceção interna executando ferramenta {name}: {str(e)}")
        return {"erro": f"Falha na comunicação: {str(e)}"}

async def process_chat(user_id: str, phone_number: str, user_name: str, message: str, token: str) -> str:
    # Obtém ou inicializa o histórico do número
    history = conversation_histories.get(phone_number, [])
    
    # Contexto temporal
    today = datetime.date.today()
    today_date = today.strftime("%d/%m/%Y")
    weekdays = ["Segunda-feira", "Terça-feira", "Quarta-feira", "Quinta-feira", "Sexta-feira", "Sábado", "Domingo"]
    weekday = weekdays[today.weekday()]
    
    # Busca as categorias reais do backend para injetar no prompt (igual ao PAD)
    headers = {"Authorization": f"Bearer {token}"}
    categorias_disponiveis = "Outros"
    try:
        async with httpx.AsyncClient(timeout=30.0) as http:
            resp = await http.get(f"{settings.BACKEND_URL}/api/Categories", headers=headers)
            if resp.status_code == 200:
                cats = resp.json()
                cat_names = []
                for c in cats:
                    if isinstance(c, str):
                        cat_names.append(c)
                    elif isinstance(c, dict):
                        name = c.get("name") or c.get("Name") or ""
                        type_str = c.get("type") or c.get("Type") or ""
                        keywords = c.get("keywords") or c.get("Keywords") or ""
                        
                        if name:
                            cat_str = f"{name} [{type_str}]" if type_str else name
                            cat_names.append(cat_str)
                if cat_names:
                    categorias_disponiveis = ", ".join(cat_names)
                    logger.info(f"Categorias carregadas para o prompt: {categorias_disponiveis}")
    except Exception as e:
        logger.warning(f"Não foi possível carregar categorias para o prompt: {e}")
    
    formatted_system_prompt = SYSTEM_PROMPT.format(
        user_name=user_name,
        today_date=today_date,
        weekday=weekday,
        categorias_disponiveis=categorias_disponiveis
    )
    
    # Prepara mensagens para execução
    run_messages: List[ChatCompletionMessageParam] = [{"role": "system", "content": formatted_system_prompt}]
    run_messages.extend(history)
    run_messages.append({"role": "user", "content": message})
    
    # headers já foi criado acima junto com a busca de categorias
    max_iterations = 5
    final_reply = ""
    
    for i in range(max_iterations):
        logger.info(f"Loop IA: Iteração {i+1}...")
        try:
            response = await client.chat.completions.create(
                model=settings.MODEL_NAME,
                messages=run_messages,
                tools=tools,
                tool_choice="auto",
                temperature=0.3,
                parallel_tool_calls=False
            )
        except Exception as e:
            logger.error(f"Erro na completion da IA: {str(e)}")
            return "Desculpe, não consegui processar sua mensagem agora. Pode tentar novamente em instantes? 🧠🤖"

        response_message = response.choices[0].message
        tool_calls = response_message.tool_calls
        
        # Se tool_calls está vazio, tenta extrair chamadas de função em formato de tags de texto (comum em alguns modelos da Groq)
        if not tool_calls and response_message.content and "<function>" in response_message.content:
            import re
            from openai.types.chat.chat_completion_message_tool_call import Function
            matches = re.findall(r"<function>(\w+)>(.*?)(?:</?function>|$)", response_message.content)
            if matches:
                tool_calls = []
                for idx, (func_name, func_args_str) in enumerate(matches):
                    args_str = func_args_str.strip()
                    if args_str.startswith("{") and args_str.endswith("}"):
                        try:
                            json.loads(args_str)
                        except Exception:
                            args_str = args_str.replace("'", '"')
                    
                    tool_calls.append(
                        ChatCompletionMessageToolCall(
                            id=f"call_{idx}_{int(datetime.datetime.now().timestamp())}",
                            type="function",
                            function=Function(name=func_name, arguments=args_str)
                        )
                    )
        
        # Se não há mais chamadas de ferramenta, temos o texto final
        if not tool_calls:
            final_reply = response_message.content or ""
            run_messages.append({"role": "assistant", "content": final_reply})
            break
            
        # Adiciona a mensagem do assistente que iniciou as chamadas de ferramenta
        assistant_msg: ChatCompletionMessageParam = {
            "role": "assistant",
            "content": response_message.content,
            "tool_calls": [
                {
                    "id": tc.id,
                    "type": "function",
                    "function": {
                        "name": tc.function.name,
                        "arguments": tc.function.arguments
                    }
                } for tc in tool_calls if isinstance(tc, ChatCompletionMessageToolCall)
            ]
        }
        run_messages.append(assistant_msg)
        
        # Executa cada tool_call de forma assíncrona
        for tool_call in tool_calls:
            if not isinstance(tool_call, ChatCompletionMessageToolCall):
                continue
            function_name = tool_call.function.name
            try:
                function_args = json.loads(tool_call.function.arguments) if tool_call.function.arguments else {}
            except Exception:
                function_args = {}
            tool_call_id = tool_call.id
            
            # Chama a função
            tool_result = await execute_tool(function_name, function_args, headers)
            
            # Adiciona o resultado como mensagem de ferramenta
            tool_message: ChatCompletionMessageParam = {
                "role": "tool",
                "tool_call_id": tool_call_id,
                "content": json.dumps(tool_result, ensure_ascii=False)
            }
            run_messages.append(tool_message)
    else:
        final_reply = "Desculpe, o processamento da sua solicitação demorou muito. Pode tentar simplificar a mensagem? ⏳"
        run_messages.append({"role": "assistant", "content": final_reply})

    # Atualiza o histórico persistente em memória, mantendo apenas mensagens de texto (user e assistant sem tool_calls)
    # Isso evita inflar o histórico com payloads JSON gigantes e estourar o limite de tokens da Groq (Erro 413)
    new_messages = run_messages[1 + len(history):]
    clean_new_messages = []
    for msg in new_messages:
        role = msg.get("role")
        if role == "user":
            clean_new_messages.append(msg)
        elif role == "assistant" and not msg.get("tool_calls"):
            clean_new_messages.append(msg)
            
    history.extend(clean_new_messages)
    conversation_histories[phone_number] = history[-12:]
    
    return final_reply