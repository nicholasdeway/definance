# Imagem Python oficial
FROM python:3.11-slim

# Define diretório de trabalho
WORKDIR /app

# Instala dependências do sistema
RUN apt-get update && apt-get install -y \
    gcc \
    g++ \
    && rm -rf /var/lib/apt/lists/*

# Copia e instala requirements
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Copia o código
COPY . .

# Expõe porta 8000
EXPOSE 8000

# Inicia com uvicorn
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]