# Usa uma imagem oficial leve do Node.js
FROM node:20-alpine

# Define o diretório de trabalho dentro do "computador virtual" (container)
WORKDIR /app

# Copia os arquivos de dependências primeiro (otimiza o cache do Docker)
COPY package*.json ./

# Instala todas as dependências
RUN npm install

# Copia todo o restante do código do frontend
COPY . .

# Compila o projeto Next.js (gera a versão de produção)
RUN npm run build

# Informa ao Docker que o container responderá na porta 3000
EXPOSE 3000

# Comando que será executado ao iniciar o container
CMD ["npm", "run", "start"]
