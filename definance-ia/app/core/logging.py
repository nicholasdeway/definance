import logging
import sys

def setup_logging():
    """
    Configura o formato e o nível dos logs da aplicação.
    Logs são essenciais para monitorar o comportamento da IA em produção.
    """
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
        handlers=[
            logging.StreamHandler(sys.stdout) # Exibe no terminal
        ]
    )
    return logging.getLogger("definance-ia")

logger = setup_logging()