import json
import re
import calendar
import httpx
import datetime
from typing import Dict, List, Union, Any, Optional
from difflib import SequenceMatcher

from app.core.config import settings
from app.core.logging import logger
from openai import AsyncOpenAI
from openai.types.chat import (
    ChatCompletionMessageParam,
    ChatCompletionToolParam,
    ChatCompletionMessageToolCall,
)

from zoneinfo import ZoneInfo
sp_tz = ZoneInfo("America/Sao_Paulo")


def get_now_sp() -> datetime.datetime:
    return datetime.datetime.now(sp_tz)


def get_today_sp() -> datetime.date:
    return datetime.datetime.now(sp_tz).date()


def format_currency_brl(val: float) -> str:
    """Formata número para moeda brasileira (R$ xxx,xx)."""
    is_negative = val < 0
    abs_val = abs(val)
    formatted = f"{abs_val:,.2f}"
    integer_part, decimal_part = formatted.split(".")
    integer_part = integer_part.replace(",", ".")
    result = f"{integer_part},{decimal_part}"
    return f"-{result}" if is_negative else result


# Cliente OpenAI/Groq (assíncrono)
client = AsyncOpenAI(
    api_key=settings.GROQ_API_KEY,
    base_url=settings.GROQ_BASE_URL
)

# Histórico de conversas por número de WhatsApp
conversation_histories: Dict[str, List[ChatCompletionMessageParam]] = {}

# ----------------------------------------------------------------------
# PROMPT DO SISTEMA (inclui regras de divisão [% do orçamento])
# ----------------------------------------------------------------------
SYSTEM_PROMPT = """Você é o assistente financeiro do Definance no WhatsApp. Usuário: {user_name}. Hoje: {today_date} ({weekday}).

# DIRETRIZES E FORMATO
- Responda simpática e diretamente. Máximo 1 emoji.
- Formate valores em BRL (R$ X.XXX,XX). NUNCA envie ponto como decimal (ex: use R$ 35,50, nunca 35.50).
- Use *texto* para negrito (nunca ** ou `). Ex: *Valor:* R$ 50,00. Use " | " para separar campos.
- Descrição da transação: 1ª letra maiúscula. É ABSOLUTAMENTE OBRIGATÓRIO identificar e aplicar a acentuação correta em português em TODOS os nomes de transação que você registrar (ex: se o usuário disser 'cafe', registre 'Café'; se disser 'pao', registre 'Pão'; se disser 'almoco', registre 'Almoço'; se disser 'agua', registre 'Água'). Corrija erros de digitação e gírias (ex: 'pra' -> 'para'). NUNCA use apenas nome de pessoa (ex: 'fralda pro celso' -> 'Fralda para o Celso', não 'Celso'). Preserve marcas ('Steam', 'Uber').
- Limites de categoria: se a transação retornar limite_mensal e porcentagem_limite, envie a resposta em 2 partes com "[SPLIT]" em linha própria:
  1. Confirmação do registro.
  2. Exatamente: Isso representa [porcentagem_limite]% do seu orçamento de [categoria_nome em minúsculo]. Fique de olho no teto mensal configurado para não se enrolar, em!

# REGRAS E FERRAMENTAS
1. Chame a ferramenta antes de responder.
2. registrar_movimentacao: exige VALOR. Tipo é Entrada ou Saida. NUNCA invente, estime ou alucine o valor se ele não foi dito pelo usuário (ex: se disser "comprei uma roupa no shopping" sem dizer quanto custou, você deve perguntar o valor amigavelmente antes de chamar a ferramenta).
3. registrar_conta: exige VALOR e VENCIMENTO.
4. Baixa de conta: `listar_contas`. Se achar correspondente pendente, pergunte se quer dar baixa. Após confirmação, `pagar_conta`.
5. Status: use "Pago" para compras/gastos que já ocorreram (uso de verbos no passado/presente como "comprei", "gastei", "paguei"). Use "Pendente" somente para contas futuras ou a pagar.
6. Confirmação de Valores Altos (CRÍTICO): Se o valor de um gasto/despesa (Saida) ou conta a pagar for maior que R$ 2.000,00, você NUNCA deve registrar (não chame registrar_movimentacao nem registrar_conta) imediatamente. Pergunte primeiro se o valor de R$ X.XXX,XX está correto para o item/conta e peça a confirmação do usuário (ex: "O valor de R$ 10.000,00 para 'Figurinha da Copa' está correto?"). Só realize o registro após o usuário confirmar em mensagem subsequente.

# TEMPLATES OBRIGATÓRIOS
- Confirmação de Registro:
  [Despesa/Entrada/Conta/Conta Fixa] no [Nome] registrada com sucesso! 📊💸
  *Valor:* R$ [Valor]
  *Categoria:* [Categoria] (omitir se Entrada)
  *Descrição:* [Nome]
  *Status:* [Status]
  *Data:* [DD/MM/YYYY]
- Resumo Financeiro:
  Nicholas, aqui está o resumo financeiro para o período solicitado:
  *Total de Receitas:* R$ [totalReceitas]
  *Total de Despesas:* R$ [totalDespesas]
  *Saldo:* R$ [saldoFinal]
  *Detalhamento de Entradas (Receitas):*
  - [receita]: R$ [valor]
  *Detalhamento de Despesas por Categoria:*
  - [categoria]: R$ [valor]
  [Se contasPendentes > 0] Você tem [X] conta(s) pendente(s) em aberto.
- Listagem de Contas:
  Nicholas, você tem [X] contas em aberto:
  * [Nome] no valor de R$ [Valor], com vencimento em [DD/MM/YYYY], [Status]. (Se vazia: "Nicholas, você não tem contas em aberto no momento.")
- Listagem de Metas:
  Nicholas, aqui estão suas metas de economia:
  * [name]: R$ [currentAmount] de R$ [targetAmount] (Falta R$ [restante]) | Progresso: [progresso]% | Categoria: [category] (Se vazia: "Nicholas, você não tem nenhuma meta de economia cadastrada no momento.")
- Depósito em Meta:
  Depósito de R$ [Valor] realizado com sucesso na meta [name]! 📊💸
  *Novo Saldo da Meta:* R$ [currentAmount] de R$ [targetAmount]
  *Status:* [Concluída/Em Andamento]

# Categorias Disponíveis
{categorias_disponiveis}

# CLASSIFICAÇÃO E INTERFACE
- Tipo Saida: compra, gasto, pagamento, jogo, app, comida, conta, taxa.
- Tipo Entrada: salário, receita, renda, freelance, recebimento.
- Dúvida sobre Tipo: NÃO registre. Pergunte: "Isso foi uma *despesa* (saída) or uma *receita* (entrada)? 💸"
- Dúvida sobre Categoria: NÃO registre e NÃO use "Outros" automaticamente. Pergunte: "Em qual categoria devo registrar isso? As opções disponíveis são: [categorias]" (Use "Outros" apenas se o usuário escolher).
- Interface: NUNCA exiba ao usuário nomes de ferramentas como "listar_categorias", "registrar_movimentacao", etc., nem envie comandos internos.
"""

# ----------------------------------------------------------------------
# DEFINIÇÃO DAS FERRAMENTAS (mesma que funcionava antes)
# ----------------------------------------------------------------------
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
                    "nome": {"type": "string", "description": "Nome da transação (Ex: 'Café', 'Almoço', 'Pão', 'Água'). IMPORTANTE: Identifique e aplique rigorosamente a acentuação correta e ortografia em português, capitalizando a primeira letra."},
                    "valor": {"type": "number", "description": "Valor numérico da transação. Obrigatório. Se o tipo for Saida e o valor for maior que 2000, NÃO chame esta ferramenta antes de pedir confirmação ao usuário e receber sua validação na mensagem subsequente."},
                    "categoria": {"type": "string", "description": "Categoria (obrigatória para Saida)."},
                    "data": {"type": "string", "description": "Data YYYY-MM-DD. Opcional."},
                    "status": {"type": "string", "enum": ["Pago", "Pendente"], "description": "Use 'Pago' para gastos/compras que já aconteceram (ex: 'comprei', 'gastei', 'paguei'). Use 'Pendente' para contas futuras ou a pagar. Padrão: 'Pago'."},
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
                    "nome": {"type": "string", "description": "Nome da conta (Ex: 'Água', 'Luz', 'Internet', 'Gás'). IMPORTANTE: Identifique e aplique rigorosamente a acentuação correta e ortografia em português, capitalizando a primeira letra."},
                    "valor": {"type": "number", "description": "Valor da conta. Se o valor for maior que 2000, NÃO chame esta ferramenta antes de pedir confirmação ao usuário e receber sua validação na mensagem subsequente."},
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

# ----------------------------------------------------------------------
# FUNÇÕES AUXILIARES
# ----------------------------------------------------------------------
def _similaridade(a: str, b: str) -> float:
    return SequenceMatcher(None, a, b).ratio()


def remove_accents(input_str: str) -> str:
    import unicodedata
    nfkd_form = unicodedata.normalize('NFKD', input_str)
    return "".join([c for c in nfkd_form if not unicodedata.combining(c)])


def format_transaction_name(name: str | None) -> str:
    if not name:
        return "Sem nome"
    name = name.strip()
    if not name:
        return "Sem nome"
    words = name.split()
    formatted_words = []
    for i, word in enumerate(words):
        w = word.lower().strip(",.?!:;()")
        if w == "clt":
            wc = "CLT"
        elif w == "pj":
            wc = "PJ"
        else:
            if i == 0:
                wc = word[0].upper() + word[1:] if len(word) > 0 else word
            else:
                wc = word
        if w:
            idx = word.lower().find(w)
            prefix = word[:idx]
            suffix = word[idx + len(w):]
            wc = prefix + wc + suffix
        formatted_words.append(wc)
    return " ".join(formatted_words)


def _sanitize_date(date_str: str | None) -> str:
    """Corrige anos antecipados e normaliza DD/MM/YYYY → YYYY-MM-DD."""
    if not date_str:
        return get_now_sp().strftime("%Y-%m-%dT%H:%M:%S")
    if "/" in date_str:
        try:
            parts = re.split(r"[T ]", date_str)
            date_part = parts[0]
            time_part = parts[1] if len(parts) > 1 else get_now_sp().strftime("%H:%M:%S")
            d, m, y = date_part.split("/")
            date_str = f"{y}-{m}-{d}T{time_part}"
        except Exception as e:
            logger.warning(f"Falha ao normalizar data com barra '{date_str}': {e}")
    current_year = get_today_sp().year
    m = re.match(r"^(\d{4})-(.*)$", date_str)
    if m:
        gy = int(m.group(1))
        if gy < current_year:
            corrected = f"{current_year}-{m.group(2)}"
            logger.info(f"Data corrigida de '{date_str}' para '{corrected}' (ano alucinado pela IA: {gy})")
            return corrected
    return date_str


# ----------------------------------------------------------------------
# RESOLUÇÃO DE CATEGORIA (pode retornar None → pede esclarecimento)
# ----------------------------------------------------------------------
async def _resolve_category(
    sugesto: str | None,
    headers: dict,
    cat_names: Optional[List[str]] = None,
    cat_objects: Optional[List[dict]] = None,
) -> Optional[str]:
    """
    Retorna:
        - str  : nome da categoria quando a confiança for alta.
        - None : quando a confiança for baixa → o chamador deve pedir ao usuário.
    """
    if not sugesto:
        return None

    # Carrega categorias se necessário
    if cat_names is None and cat_objects is None:
        try:
            async with httpx.AsyncClient(timeout=30.0) as http:
                resp = await http.get(f"{settings.BACKEND_URL}/api/Categories", headers=headers)
                if resp.status_code != 200:
                    return None
                data = resp.json()
                cat_names = []
                cat_objects = []
                for c in data:
                    if isinstance(c, str):
                        cat_names.append(c)
                    elif isinstance(c, dict):
                        n = c.get("name") or c.get("Name") or ""
                        if n:
                            cat_names.append(n)
                            cat_objects.append(c)
                cat_names = [c for c in cat_names if c]
        except Exception as e:
            logger.warning(f"Não foi possível buscar categorias para resolver sugestão: {e}")
            return None
    elif cat_names is not None and cat_objects is None:
        cat_objects = []

    cat_names = cat_names or []
    cat_objects = cat_objects or []

    s_low = sugesto.lower().strip()
    s_norm = remove_accents(s_low)

    # 1️⃣ Palavra‑chave (prioridade máxima)
    if cat_objects:
        for cobj in cat_objects:
            cname = cobj.get("name") or cobj.get("Name") or ""
            if not cname:
                continue
            kw_raw = cobj.get("keywords") or cobj.get("Keywords") or ""
            if not kw_raw:
                continue
            if isinstance(kw_raw, str):
                kws = [k.strip().lower() for k in kw_raw.split(",") if k.strip()]
            else:
                kws = [str(k).strip().lower() for k in kw_raw if str(k).strip()]
            for kw in kws:
                kw_n = remove_accents(kw)
                if re.search(rf"\b{re.escape(kw_n)}\b", s_norm):
                    logger.info(f"Categoria por palavra‑chave '{kw}': '{sugesto}' -> '{cname}'")
                    return cname

    # 2️⃣ Correspondência exata
    for c in cat_names:
        if c.lower().strip() == s_low or remove_accents(c.lower().strip()) == s_norm:
            logger.info(f"Categoria exata: '{sugesto}' -> '{c}'")
            return c

    # 3️⃣ Palavra inteira (ou vice‑versa)
    for c in cat_names:
        if c.lower() == "outros":
            continue
        cl = c.lower().strip()
        cn = remove_accents(cl)
        if re.search(rf"\b{re.escape(cn)}\b", s_norm) or re.search(rf"\b{re.escape(s_norm)}\b", cn):
            logger.info(f"Categoria palavra/normalizada: '{sugesto}' -> '{c}'")
            return c

    # 4️⃣ Substring
    for c in cat_names:
        if c.lower() == "outros":
            continue
        cl = c.lower().strip()
        cn = remove_accents(cl)
        if cn in s_norm or s_norm in cn:
            logger.info(f"Categoria substring/normalizada: '{sugesto}' -> '{c}'")
            return c

    # 5️⃣ Similaridade (fallback)
    best_score = 0.0
    best_cat = None
    for c in cat_names:
        if c.lower() == "outros":
            continue
        sc = _similaridade(s_norm, remove_accents(c.lower()))
        if sc > best_score:
            best_score = sc
            best_cat = c

    CONFIDENCE_THRESHOLD = 0.6
    if best_score >= CONFIDENCE_THRESHOLD and best_cat is not None:
        logger.info(f"Categoria por similaridade ({best_score:.2f}): '{sugesto}' -> '{best_cat}'")
        return best_cat

    logger.info(
        f"Categoria sem confiança suficiente para '{sugesto}' (score {best_score:.2f}) → solicitando esclarecimento."
    )
    return None


# ----------------------------------------------------------------------
# EXECUTOR DE FERRAMENTAS
# ----------------------------------------------------------------------
async def execute_tool(name: str, args: dict | None, headers: dict) -> Union[dict, list]:
    if not isinstance(args, dict):
        args = {}
    try:
        async with httpx.AsyncClient(timeout=30.0) as http:
            # -------------------- OBTER RESUMO --------------------
            if name == "obter_resumo_financeiro":
                mes = args.get("mes")
                ano = args.get("ano")
                if mes is not None:
                    try: mes = int(mes)
                    except: pass
                if ano is not None:
                    try: ano = int(ano)
                    except: pass
                params = {}
                if mes: params["month"] = mes
                if ano: params["year"] = ano
                resp = await http.get(f"{settings.BACKEND_URL}/api/Analysis", params=params, headers=headers)
                if resp.status_code != 200:
                    return {"erro": f"Erro do servidor backend (status {resp.status_code})"}
                data = resp.json()

                # Busca categorias para agrupamento
                cat_names = []
                try:
                    rc = await http.get(f"{settings.BACKEND_URL}/api/Categories", headers=headers)
                    if rc.status_code == 200:
                        for c in rc.json():
                            if isinstance(c, str):
                                cat_names.append(c)
                            elif isinstance(c, dict):
                                cat_names.append(c.get("name") or c.get("Name") or "")
                        cat_names = [x for x in cat_names if x]
                except Exception as e:
                    logger.warning(f"Erro ao pré‑buscar categorias no resumo: {e}")

                total_rec = data.get("totalReceitas") or data.get("TotalReceitas") or 0.0
                total_desp = data.get("totalDespesas") or data.get("TotalDespesas") or 0.0
                total_atr = data.get("totalAtrasadas") or data.get("TotalAtrasadas") or 0.0
                saldo = data.get("saldoFinal") or data.get("SaldoFinal") or 0.0

                compact = {
                    "totalReceitas": format_currency_brl(total_rec),
                    "totalDespesas": format_currency_brl(total_desp),
                    "totalAtrasadas": format_currency_brl(total_atr),
                    "contasPendentes": data.get("contasPendentes") or data.get("ContasPendentes") or 0,
                    "saldoFinal": format_currency_brl(saldo),
                }

                # Agrupa despesas por categoria
                cats_src = data.get("categoryAnalysis") or data.get("CategoryAnalysis") or []
                grp_cats = {}
                for c in cats_src:
                    cname = c.get("categoria") or c.get("Categoria") or ""
                    amt = c.get("valor") or c.get("Valor") or 0.0
                    if cname:
                        resolved = await _resolve_category(cname, headers, cat_names)
                        key = resolved or cname
                        grp_cats[key] = grp_cats.get(key, 0.0) + amt
                cats_clean = [
                    {"categoria": k, "valor": format_currency_brl(v)}
                    for k, v in sorted(grp_cats.items(), key=lambda x: x[1], reverse=True)
                ]
                compact["analiseCategorias"] = cats_clean

                # Agrupa receitas por tipo
                inc_src = data.get("incomeAnalysis") or data.get("IncomeAnalysis") or []
                grp_inc = {}
                for i in inc_src:
                    iname = i.get("tipo") or i.get("Tipo") or ""
                    amt = i.get("valor") or i.get("Valor") or 0.0
                    if iname:
                        ilow = iname.lower().strip()
                        if ilow == "clt":
                            res = "CLT"
                        elif ilow == "pj":
                            res = "PJ"
                        elif ilow in ("autonomo", "autônomo"):
                            res = "Autônomo"
                        elif ilow in ("freelancer", "freelance"):
                            res = "Freelancer"
                        else:
                            res = iname.strip().capitalize()
                        grp_inc[res] = grp_inc.get(res, 0.0) + amt
                inc_clean = [
                    {"receita": k, "valor": format_currency_brl(v)}
                    for k, v in sorted(grp_inc.items(), key=lambda x: x[1], reverse=True)
                ]
                compact["analiseReceitas"] = inc_clean
                return compact

            # -------------------- REGISTRAR MOVIMENTAÇÃO --------------------
            elif name == "registrar_movimentacao":
                tipo = args.get("tipo")
                nome = args.get("nome")
                if nome:
                    nome = nome.strip()
                    if len(nome) > 0:
                        nome = nome[0].upper() + nome[1:]
                valor = args.get("valor")
                if valor is not None:
                    try: valor = float(valor)
                    except: pass
                categoria = args.get("categoria")
                data = args.get("data")
                status = args.get("status", "Pago")
                recorrente = args.get("recorrente", False)

                # Resolve categoria (pode ser None) apenas se for Saida
                if tipo != "Entrada":
                    categoria = await _resolve_category(categoria, headers)
                    if categoria is None:
                        # Pede esclarecimento ao usuário
                        async with httpx.AsyncClient(timeout=10.0) as h2:
                            cat_resp = await h2.get(f"{settings.BACKEND_URL}/api/Categories", headers=headers)
                            if cat_resp.status_code == 200:
                                cats = cat_resp.json()
                                clist = []
                                for c in cats:
                                    if isinstance(c, str):
                                        clist.append(c)
                                    elif isinstance(c, dict):
                                        clist.append(c.get("name") or c.get("Name") or "")
                                clist = [c for c in clist if c]
                                lista_fmt = ", ".join(clist)
                                return {
                                    "precisa_clarificar": True,
                                    "mensagem": f"Em qual categoria devo registrar isso? As opções disponíveis são: {lista_fmt}"
                                }
                        return {
                            "precisa_clarificar": True,
                            "mensagem": "Em qual categoria devo registrar isso? (Não consegui obter a lista de categorias agora.)"
                        }

                # Sanitiza data
                data = _sanitize_date(data)
                if len(data) == 10:
                    data = f"{data}T{get_now_sp().strftime('%H:%M:%S')}"

                if tipo == "Entrada":
                    url = f"{settings.BACKEND_URL}/api/Incomes"
                    payload = {
                        "name": nome,
                        "amount": valor,
                        "type": "Variável",
                        "date": data,
                        "isRecurring": recorrente
                    }
                    resp = await http.post(url, json=payload, headers=headers)
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
                    resp = await http.post(url, json=payload, headers=headers)

                if resp.status_code in (200, 201):
                    res_data = resp.json()
                    # Busca limite mensal da categoria (se houver)
                    if tipo != "Entrada":
                        try:
                            rc = await http.get(f"{settings.BACKEND_URL}/api/Categories", headers=headers)
                            if rc.status_code == 200:
                                limit = None
                                cname_official = categoria
                                for c in rc.json():
                                    cname = c.get("name") or c.get("Name")
                                    if categoria and cname and cname.lower().strip() == categoria.lower().strip():
                                        limit = c.get("monthlyLimit") or c.get("MonthlyLimit")
                                        cname_official = cname
                                        break
                                
                                if limit is not None and float(limit) > 0:
                                    total_acumulado = float(valor) if valor is not None else 0.0
                                    try:
                                        t_date = get_today_sp()
                                        if data:
                                            try:
                                                t_date = datetime.datetime.strptime(data.split("T")[0], "%Y-%m-%d").date()
                                            except Exception:
                                                pass
                                        params = {"month": t_date.month, "year": t_date.year}
                                        ra = await http.get(f"{settings.BACKEND_URL}/api/Analysis", params=params, headers=headers)
                                        if ra.status_code == 200:
                                            analysis = ra.json()
                                            cat_analysis = analysis.get("categoryAnalysis") or analysis.get("CategoryAnalysis") or []
                                            for cat_item in cat_analysis:
                                                cat_name_item = cat_item.get("categoria") or cat_item.get("Categoria")
                                                if categoria and cat_name_item and cat_name_item.lower().strip() == categoria.lower().strip():
                                                    total_acumulado = float(cat_item.get("valor") or cat_item.get("Valor") or 0.0)
                                                    break
                                    except Exception as ae:
                                        logger.warning(f"Erro ao buscar acumulado da categoria na análise: {ae}")
                                    
                                    res_data["limite_mensal"] = float(limit)
                                    res_data["porcentagem_limite"] = round(
                                        (total_acumulado / float(limit)) * 100
                                    )
                                    res_data["categoria_nome"] = cname_official
                        except Exception as e:
                            logger.warning(f"Erro ao buscar limite da categoria: {e}")
                    return {"sucesso": True, "dados": res_data}
                elif resp.status_code == 400:
                    return {"erro": "Dados inválidos fornecidos para o registro.", "detalhes": resp.json()}
                else:
                    return {"erro": f"Erro ao registrar no backend (status {resp.status_code})"}

            # -------------------- LISTAR CATEGORIAS --------------------
            elif name == "listar_categorias":
                resp = await http.get(f"{settings.BACKEND_URL}/api/Categories", headers=headers)
                if resp.status_code == 200:
                    return resp.json()
                return {"erro": f"Erro do servidor backend (status {resp.status_code})"}

            # -------------------- LISTAR ULTIMAS MOVIMENTAÇÕES --------------------
            elif name == "listar_ultimas_movimentacoes":
                tipo = args.get("tipo", "Todas")
                limite = args.get("limite", 5)
                if limite is not None:
                    try: limite = int(limite)
                    except: limite = 5
                inc, exp = [], []
                if tipo in ("Entrada", "Todas"):
                    r = await http.get(f"{settings.BACKEND_URL}/api/Incomes", headers=headers)
                    if r.status_code == 200:
                        inc = r.json()
                if tipo in ("Saida", "Todas"):
                    r = await http.get(f"{settings.BACKEND_URL}/api/Expenses", headers=headers)
                    if r.status_code == 200:
                        exp = r.json()
                # cat names para resolver
                cat_names = []
                try:
                    rc = await http.get(f"{settings.BACKEND_URL}/api/Categories", headers=headers)
                    if rc.status_code == 200:
                        for c in rc.json():
                            if isinstance(c, str):
                                cat_names.append(c)
                            elif isinstance(c, dict):
                                cat_names.append(c.get("name") or c.get("Name") or "")
                        cat_names = [x for x in cat_names if x]
                except Exception as e:
                    logger.warning(f"Erro ao pré‑buscar categorias no histórico: {e}")

                combined = []
                for i in inc:
                    combined.append({
                        "id": i.get("id"),
                        "nome": i.get("name"),
                        "valor": i.get("amount"),
                        "tipo": "Entrada",
                        "categoria": "Receita",
                        "data": i.get("date")
                    })
                for e in exp:
                    rc = e.get("category")
                    rcat = await _resolve_category(rc, headers, cat_names)
                    combined.append({
                        "id": e.get("id"),
                        "nome": e.get("name"),
                        "valor": e.get("amount"),
                        "tipo": "Saída",
                        "categoria": rcat or "Outros",
                        "data": e.get("date"),
                        "status": e.get("status")
                    })
                combined.sort(key=lambda x: x.get("data", ""), reverse=True)
                return combined[:limite]

            # -------------------- REGISTRAR CONTA --------------------
            elif name == "registrar_conta":
                nome = args.get("nome")
                if nome:
                    nome = nome.strip()
                    if len(nome) > 0:
                        nome = nome[0].upper() + nome[1:]
                valor = args.get("valor")
                if valor is not None:
                    try: valor = float(valor)
                    except: pass
                categoria = args.get("categoria", "Outros")
                data_venc = args.get("data_vencimento")
                status = args.get("status", "Pendente")
                recorrente = args.get("recorrente", False)
                dia_venc = args.get("dia_vencimento")

                data_venc = _sanitize_date(data_venc)
                categoria = await _resolve_category(categoria, headers)
                if categoria is None:
                    async with httpx.AsyncClient(timeout=10.0) as h2:
                        cat_resp = await h2.get(f"{settings.BACKEND_URL}/api/Categories", headers=headers)
                        if cat_resp.status_code == 200:
                            cats = cat_resp.json()
                            clist = []
                            for c in cats:
                                if isinstance(c, str):
                                    clist.append(c)
                                elif isinstance(c, dict):
                                    clist.append(c.get("name") or c.get("Name") or "")
                            clist = [c for c in clist if c]
                            lista_fmt = ", ".join(clist)
                            return {
                                "precisa_clarificar": True,
                                "mensagem": f"Em qual categoria devo registrar essa conta? As opções disponíveis são: {lista_fmt}"
                            }
                    return {
                        "precisa_clarificar": True,
                        "mensagem": "Em qual categoria devo registrar essa conta? (Não consegui obter a lista de categorias agora.)"
                    }

                if valor is not None:
                    try: valor = float(valor)
                    except: pass
                if dia_venc is not None:
                    try: dia_venc = int(dia_venc)
                    except: dia_venc = None
                if dia_venc is None and data_venc:
                    try:
                        dia_venc = int(data_venc.split("T")[0].split("-")[2])
                    except Exception:
                        pass

                # Ajuste de vencimento para recorrentes
                if recorrente and status == "Pendente" and data_venc:
                    try:
                        y, m, d = map(int, data_venc.split("T")[0].split("-"))
                        due = datetime.date(y, m, d)
                        today = get_today_sp()
                        if due <= today:
                            if m == 12:
                                nm, ny = 1, y + 1
                            else:
                                nm, ny = m + 1, y
                            last_day = calendar.monthrange(ny, nm)[1]
                            nd = min(d, last_day)
                            new_due = datetime.date(ny, nm, nd)
                            data_venc = new_due.strftime("%Y-%m-%d")
                            dia_venc = nd
                            logger.info(
                                f"Ajustando vencimento de conta recorrente de {due} para {data_venc}"
                            )
                    except Exception as e:
                        logger.error(f"Erro ao ajustar vencimento recorrente: {e}")

                url = f"{settings.BACKEND_URL}/api/Bills"
                payload = {
                    "name": nome,
                    "amount": valor,
                    "category": categoria,
                    "dueDate": data_venc,
                    "dueDay": dia_venc,
                    "status": status,
                    "isRecurring": recorrente,
                    "billType": "Fixa" if recorrente else "Variável",
                    "description": "Registrado via WhatsApp"
                }
                resp = await http.post(url, json=payload, headers=headers)
                if resp.status_code in (200, 201):
                    return {"sucesso": True, "dados": resp.json()}
                return {"erro": f"Erro ao registrar conta no backend (status {resp.status_code})"}

            # -------------------- LISTAR CONTAS --------------------
            elif name == "listar_contas":
                mes = args.get("mes")
                ano = args.get("ano")
                if mes is not None:
                    try: mes = int(mes)
                    except: pass
                if ano is not None:
                    try: ano = int(ano)
                    except: pass
                params = {}
                if mes: params["month"] = mes
                if ano: params["year"] = ano
                resp = await http.get(f"{settings.BACKEND_URL}/api/Bills", params=params, headers=headers)
                if resp.status_code == 200:
                    return resp.json()
                return {"erro": f"Erro do servidor backend (status {resp.status_code})"}

            # -------------------- PAGAR CONTA --------------------
            elif name == "pagar_conta":
                conta_id = args.get("conta_id")
                data_pag = args.get("data_pagamento")
                data_pag = _sanitize_date(data_pag)
                url = f"{settings.BACKEND_URL}/api/Bills/{conta_id}/pay"
                payload = {"paymentDate": data_pag}
                resp = await http.put(url, json=payload, headers=headers)
                if resp.status_code == 200:
                    return {"sucesso": True, "dados": resp.json()}
                return {"erro": f"Erro ao pagar conta no backend (status {resp.status_code})"}

            # -------------------- LISTAR METAS --------------------
            elif name == "listar_metas":
                resp = await http.get(f"{settings.BACKEND_URL}/api/Goals", headers=headers)
                if resp.status_code == 200:
                    return resp.json()
                return {"erro": f"Erro do servidor backend (status {resp.status_code})"}

            # -------------------- DEPOSITAR META --------------------
            elif name == "depositar_meta":
                mid = args.get("meta_id")
                mname = args.get("meta_nome")
                valor = args.get("valor")
                if valor is not None:
                    try: valor = float(valor)
                    except: pass
                if not mid and mname:
                    try:
                        gr = await http.get(f"{settings.BACKEND_URL}/api/Goals", headers=headers)
                        if gr.status_code == 200:
                            goals = gr.json()
                            mname_l = mname.lower().strip()
                            matches = []
                            for g in goals:
                                gname = g.get("name", "").lower().strip()
                                if gname == mname_l:
                                    matches = [g]
                                    break
                                if mname_l in gname or gname in mname_l:
                                    matches.append(g)
                            if len(matches) == 1:
                                mid = matches[0]["id"]
                                logger.info(f"Meta resolvida por nome '{mname}' -> '{matches[0]['name']}' (ID:{mid})")
                            elif len(matches) > 1:
                                names = ", ".join([g.get("name", "") for g in matches])
                                return {"erro": f"Mais de uma mesa com nomes semelhantes: {names}. Seja mais específico."}
                            else:
                                return {"erro": f"Nenhuma mesa encontrada para o nome '{mname}'."}
                    except Exception as e:
                        logger.error(f"Erro ao resolver meta por nome: {e}")
                        return {"erro": "Erro interno ao buscar metas pelo nome."}
                if not mid:
                    return {"erro": "ID ou nome da meta não especificado."}
                url = f"{settings.BACKEND_URL}/api/Goals/{mid}/deposit"
                payload = {"amount": valor}
                resp = await http.patch(url, json=payload, headers=headers)
                if resp.status_code == 200:
                    return {"sucesso": True, "dados": resp.json()}
                return {"erro": f"Erro ao depositar na meta no backend (status {resp.status_code})"}

            else:
                return {"erro": f"Ferramenta '{name}' não encontrada."}
    except Exception as e:
        logger.error(f"Exceção interna ao executar ferramenta {name}: {str(e)}")
        return {"erro": f"Falha na comunicação: {str(e)}"}

# ----------------------------------------------------------------------
# PROCESSAMENTO DA CONVERSA
# ----------------------------------------------------------------------
async def process_chat(user_id: str, phone_number: str, user_name: str, message: str, token: str) -> str:
    history = conversation_histories.get(phone_number, [])
    hoje = get_today_sp()
    hoje_str = hoje.strftime("%d/%m/%Y")
    dia_semana = ["Segunda-feira", "Terça-feira", "Quarta-feira", "Quinta-feira",
                  "Sexta-feira", "Sábado", "Domingo"][hoje.weekday()]

    headers = {"Authorization": f"Bearer {token}"}
    # Carrega categorias para o prompt (mesma lógica do functional)
    categorias_disponiveis = "Outros"
    try:
        async with httpx.AsyncClient(timeout=30.0) as http:
            r = await http.get(f"{settings.BACKEND_URL}/api/Categories", headers=headers)
            if r.status_code == 200:
                cats = r.json()
                nomes = []
                for c in cats:
                    if isinstance(c, str):
                        nomes.append(c)
                    elif isinstance(c, dict):
                        n = c.get("name") or c.get("Name") or ""
                        t = c.get("type") or c.get("Type") or ""
                        k = c.get("keywords") or c.get("Keywords") or ""
                        s = f"{n} [{t}]" if t else n
                        if k:
                            s += f" (palavras-chave: {k})"
                        nomes.append(s)
                if nomes:
                    categorias_disponiveis = ", ".join(nomes)
                    logger.info(f"Categorias carregadas para o prompt: {categorias_disponiveis}")
    except Exception as e:
        logger.warning(f"Não foi possível carregar categorias para o prompt: {e}")

    system_prompt = SYSTEM_PROMPT.format(
        user_name=user_name,
        today_date=hoje_str,
        weekday=dia_semana,
        categorias_disponiveis=categorias_disponiveis
    )

    run_messages: List[ChatCompletionMessageParam] = [
        {"role": "system", "content": system_prompt}
    ]
    run_messages.extend(history)
    run_messages.append({"role": "user", "content": message})

    max_it = 5
    final_reply = ""
    for i in range(max_it):
        logger.info(f"Loop IA: Iteração {i+1}")
        try:
            resp = await client.chat.completions.create(
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

        msg = resp.choices[0].message
        tool_calls = msg.tool_calls

        # Caso o modelo devolva chamadas em formato de texto (<function>...)
        if not tool_calls and msg.content and "<function>" in msg.content:
            import re
            from openai.types.chat.chat_completion_message_tool_call import Function
            matches = re.findall(r"<function>(\w+)>(.*?)(?:</?function>|$)", msg.content)
            if matches:
                tool_calls = []
                for idx, (fname, fargs) in enumerate(matches):
                    fargs = fargs.strip()
                    if fargs.startswith("{") and fargs.endswith("}"):
                        try:
                            json.loads(fargs)
                        except Exception:
                            fargs = fargs.replace("'", '"')
                    tool_calls.append(
                        ChatCompletionMessageToolCall(
                            id=f"call_{idx}_{int(get_now_sp().timestamp())}",
                            type="function",
                            function=Function(name=fname, arguments=fargs)
                        )
                    )

        if not tool_calls:
            final_reply = msg.content or ""
            run_messages.append({"role": "assistant", "content": final_reply})
            break

        # Assistente que pediu as ferramentas
        assistant_msg: ChatCompletionMessageParam = {
            "role": "assistant",
            "content": msg.content,
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

        # Executa cada tool call
        for tc in tool_calls:
            if not isinstance(tc, ChatCompletionMessageToolCall):
                continue
            fname = tc.function.name
            try:
                fargs = json.loads(tc.function.arguments) if tc.function.arguments else {}
            except Exception:
                fargs = {}
            tc_id = tc.id
            result = await execute_tool(fname, fargs, headers)

            # Se o resultado indicar que precisamos de esclarecimento (categoria)
            if isinstance(result, dict) and result.get("precisa_clarificar"):
                final_reply = result.get("mensagem", "")
                run_messages.append({"role": "assistant", "content": final_reply})
                
                # Salva o histórico de conversa antes de retornar precoce
                new_msgs = run_messages[1 + len(history):]
                clean = []
                for m in new_msgs:
                    if m.get("role") == "user":
                        clean.append(m)
                    elif m.get("role") == "assistant" and not m.get("tool_calls"):
                        clean.append(m)
                history.extend(clean)
                conversation_histories[phone_number] = history[-12:]
                return final_reply

            # Caso contrário, registramos o resultado como mensagem de ferramenta
            tool_msg: ChatCompletionMessageParam = {
                "role": "tool",
                "tool_call_id": tc_id,
                "content": json.dumps(result, ensure_ascii=False)
            }
            run_messages.append(tool_msg)
    else:
        final_reply = "Desculpe, o processamento da sua solicitação demorou muito. Pode tentar simplificar a mensagem? ⏳"
        run_messages.append({"role": "assistant", "content": final_reply})
    # Garante formatação correta de limite de categoria se a transação retornou limites
    limit_info = None
    for m in run_messages:
        if m.get("role") == "tool":
            try:
                content_str = m.get("content")
                if isinstance(content_str, str):
                    content_obj = json.loads(content_str)
                    if isinstance(content_obj, dict) and content_obj.get("sucesso"):
                        dados = content_obj.get("dados", {})
                        if isinstance(dados, dict) and "porcentagem_limite" in dados and "categoria_nome" in dados:
                            limit_info = {
                                "porcentagem_limite": dados["porcentagem_limite"],
                                "categoria_nome": dados["categoria_nome"]
                            }
            except Exception:
                pass

    if limit_info and final_reply:
        first_part = final_reply.split("[SPLIT]")[0].strip()
        first_part = first_part.replace("**", "*")
        cat_lower = limit_info["categoria_nome"].lower().strip()
        pct = limit_info["porcentagem_limite"]
        second_part = f"Isso representa {pct}% do seu orçamento de {cat_lower}. Fique de olho no teto mensal configurado para não se enrolar, em!"
        final_reply = f"{first_part}\n[SPLIT]\n{second_part}"
        if run_messages and run_messages[-1].get("role") == "assistant":
            run_messages[-1]["content"] = final_reply
    elif not limit_info and final_reply:
        if "[SPLIT]" in final_reply:
            final_reply = final_reply.split("[SPLIT]")[0].strip()
        elif "Isso representa" in final_reply:
            lines = final_reply.split("\n")
            clean_lines = []
            for line in lines:
                if "Isso representa" in line:
                    break
                clean_lines.append(line)
            final_reply = "\n".join(clean_lines).strip()
        final_reply = final_reply.replace("**", "*")
        if run_messages and run_messages[-1].get("role") == "assistant":
            run_messages[-1]["content"] = final_reply

    # Atualiza histórico (mantém apenas mensagens de texto)
    new_msgs = run_messages[1 + len(history):]
    clean = []
    for m in new_msgs:
        if m.get("role") == "user":
            clean.append(m)
        elif m.get("role") == "assistant" and not m.get("tool_calls"):
            clean.append(m)
    history.extend(clean)
    conversation_histories[phone_number] = history[-12:]
    return final_reply