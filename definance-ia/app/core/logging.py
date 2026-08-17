import logging
import sys

def setup_logging():
    """
    Configura o formato e o nível dos logs da aplicação.
    Logs são essenciais para monitorar o comportamento da IA em produção.
    """
    if hasattr(sys.stdout, 'reconfigure'):
        try:
            sys.stdout.reconfigure(encoding='utf-8', errors='replace')
        except Exception:
            pass

    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
        handlers=[
            logging.StreamHandler(sys.stdout)
        ]
    )
    return logging.getLogger("definance-ia")

logger = setup_logging()