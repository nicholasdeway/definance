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

SYSTEM_PROMPT = """Você é o assistente financeiro do Definance no WhatsApp. Nome do usuário: {user_name}.
Hoje é {today_date} ({weekday}).

# DIRETRIZES DE COMUNICAÇÃO e FORMATO
- Responda em português brasileiro, de forma simpática, direta, sem enrolação.
- Use no máximo 1 emoji por resposta.
- No WhatsApp, use *texto* para negrito (nunca use ** ou _ ou `). Ex: *Valor:* R$ 50,00.
- Use " | " (pipe com espaços) para separar campos na mesma linha.

# REGRAS DE NEGÓCIO e DE FERRAMENTAS (OBRIGATÓRIO)
1. NUNCA simule, invente ou alucine dados. Sempre execute a ferramenta correspondente antes de responder com a confirmação.
2. Para registrar movimentação ocorrida (`registrar_movimentacao`): exige VALOR. Data é opcional (padrão: hoje). NÃO exija data de vencimento para gastos ou receitas do dia a dia.
3. Para registrar conta futura (`registrar_conta`): exige VALOR e data de VENCIMENTO. Se faltar algum, pergunte amigavelmente antes de registrar.
4. Se o usuário pedir resumo, saldo ou relatórios, chame `obter_resumo_financeiro`.
5. Se pedir extrato/histórico, chame `listar_ultimas_movimentacoes` e mostre ordenado: * [DD/MM/YYYY] [Tipo] – [Nome] – R$ [Valor]
6. Se pedir contas/pendências, chame `listar_contas`.
7. Se pedir metas de economia, chame `listar_metas`.
8. Se for guardar/depositar em meta, chame `depositar_meta`.

# TEMPLATES OBRIGATÓRIOS DE RETORNO (Após retorno de sucesso da ferramenta)
- Confirmação de Registro (movimentação/conta):
  [Despesa/Entrada/Conta/Conta Fixa] no [Nome] registrada com sucesso! 📊💸
  *Valor:* R$ [Valor]
  *Categoria:* [Categoria] (omitir se Entrada)
  *Descrição:* [Nome]
  *Status:* [Status] (Pago/Pendente)
  *Data:* [DD/MM/YYYY]
- Resumo Financeiro (`obter_resumo_financeiro`):
  Nicholas, aqui está o resumo financeiro para o período solicitado:
  *Total de Receitas:* R$ [totalReceitas]
  *Total de Despesas:* R$ [totalDespesas]
  *Saldo:* R$ [saldoFinal]
  *Detalhamento de Entradas (Receitas):*
  - [receita]: R$ [valor]
  *Detalhamento de Despesas por Categoria:*
  - [categoria]: R$ [valor]
  [Se contasPendentes > 0] Você tem [X] conta(s) pendente(s) em aberto.
- Listagem de Contas (`listar_contas`):
  Nicholas, você tem [X] contas em aberto:
  * [Nome] no valor de R$ [Valor], com vencimento em [DD/MM/YYYY], [Status]. (Se lista vazia: "Nicholas, você não tem contas em aberto no momento.")
- Listagem de Metas (`listar_metas`):
  Nicholas, aqui estão suas metas de economia:
  * [name]: R$ [currentAmount] de R$ [targetAmount] (Falta R$ [restante]) | Progresso: [progresso]% | Categoria: [category] (Se vazia: "Nicholas, você não tem nenhuma meta de economia cadastrada no momento.")
- Depósito em Meta (`depositar_meta`):
  Depósito de R$ [Valor] realizado com sucesso na meta [name]! 📊💸
  *Novo Saldo da Meta:* R$ [currentAmount] de R$ [targetAmount]
  *Status:* [Concluída/Em Andamento]
- Baixa de Conta:
  1. Liste as contas com `listar_contas`.
  2. Se achar uma conta correspondente pendente, pergunte: "Nicholas, encontrei a conta de [Nome] de R$ [Valor] com vencimento em [DD/MM/YYYY]. Deseja que eu dê baixa nela agora?"
  3. Aguarde confirmação do usuário e só então chame `pagar_conta`.

# Categorias Disponíveis
{categorias_disponiveis}
"""

tools: List[ChatCompletionToolParam] = [
    {
        "type": "function",
        "function": {
            "name": "obter_resumo_financeiro",
            "description": "Obtém resumo financeiro do usuário por mês/ano.",
            "parameters": {
                "type": "object",
                "properties": {
                    "mes": {"type": "integer", "description": "Mês (1-12). Opcional."},
                    "ano": {"type": "integer", "description": "Ano (ex: 2026). Opcional."}
                }
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "registrar_movimentacao",
            "description": "Registra receita (Entrada) ou despesa (Saida).",
            "parameters": {
                "type": "object",
                "properties": {
                    "tipo": {"type": "string", "enum": ["Entrada", "Saida"], "description": "Entrada ou Saida."},
                    "nome": {"type": "string", "description": "Nome da transação."},
                    "valor": {"type": "number", "description": "Valor numérico."},
                    "categoria": {"type": "string", "description": "Categoria (obrigatória para Saida)."},
                    "data": {"type": "string", "description": "Data YYYY-MM-DD. Opcional."},
                    "status": {"type": "string", "enum": ["Pago", "Pendente"], "description": "Pago ou Pendente. Opcional."},
                    "recorrente": {"type": "boolean", "description": "Se é recorrente. Opcional."}
                },
                "required": ["tipo", "nome", "valor"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "listar_categorias",
            "description": "Lista categorias de despesas.",
            "parameters": {"type": "object", "properties": {}}
        }
    },
    {
        "type": "function",
        "function": {
            "name": "listar_ultimas_movimentacoes",
            "description": "Lista transações recentes (Entrada, Saida, Todas).",
            "parameters": {
                "type": "object",
                "properties": {
                    "tipo": {"type": "string", "enum": ["Entrada", "Saida", "Todas"], "description": "Filtro de tipo. Opcional."},
                    "limite": {"type": "integer", "description": "Limite de itens. Opcional."}
                }
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "registrar_conta",
            "description": "Cadastra conta/boleto a pagar futuro.",
            "parameters": {
                "type": "object",
                "properties": {
                    "nome": {"type": "string", "description": "Nome da conta."},
                    "valor": {"type": "number", "description": "Valor da conta."},
                    "categoria": {"type": "string", "description": "Categoria."},
                    "data_vencimento": {"type": "string", "description": "Vencimento YYYY-MM-DD."},
                    "status": {"type": "string", "enum": ["Pendente", "Pago"], "description": "Status."},
                    "recorrente": {"type": "boolean", "description": "Se é recorrente. Opcional."},
                    "dia_vencimento": {"type": "integer", "description": "Dia do vencimento. Opcional."}
                },
                "required": ["nome", "valor", "data_vencimento"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "listar_contas",
            "description": "Lista contas a pagar por mês/ano.",
            "parameters": {
                "type": "object",
                "properties": {
                    "mes": {"type": "integer", "description": "Mês. Opcional."},
                    "ano": {"type": "integer", "description": "Ano. Opcional."}
                }
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "pagar_conta",
            "description": "Registra pagamento de conta pendente por ID.",
            "parameters": {
                "type": "object",
                "properties": {
                    "conta_id": {"type": "string", "description": "ID GUID da conta."},
                    "data_pagamento": {"type": "string", "description": "Data YYYY-MM-DD. Opcional."}
                },
                "required": ["conta_id"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "listar_metas",
            "description": "Lista metas de economia do usuário.",
            "parameters": {"type": "object", "properties": {}}
        }
    },
    {
        "type": "function",
        "function": {
            "name": "depositar_meta",
            "description": "Deposita valor em uma meta por nome ou ID.",
            "parameters": {
                "type": "object",
                "properties": {
                    "meta_nome": {"type": "string", "description": "Nome parcial ou exato da meta."},
                    "meta_id": {"type": "string", "description": "ID GUID da meta. Opcional."},
                    "valor": {"type": "number", "description": "Valor a guardar."}
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