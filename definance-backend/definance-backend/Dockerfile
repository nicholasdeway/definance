# ==========================================
# Etapa 1: Build (Apenas para compilar)
# ==========================================
# Usa uma imagem mais pesada (SDK) que contém as ferramentas para compilar código
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copia apenas o arquivo .csproj e restaura os pacotes primeiro
COPY ["definance-backend.csproj", "./"]
RUN dotnet restore "definance-backend.csproj"

# Copia o resto do código C#
COPY . .

# Compila o projeto em modo Release e gera os arquivos na pasta /app/publish
RUN dotnet publish "definance-backend.csproj" -c Release -o /app/publish

# ==========================================
# Etapa 2: Execução (Leve, para rodar)
# ==========================================
# Usa uma imagem muito mais leve (ASP.NET Runtime) contendo apenas o essencial para rodar
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app

# Por padrão, ASP.NET 8 roda na porta 8080
EXPOSE 8080

# Pega o código compilado da "Etapa 1" e joga nessa máquina limpa
COPY --from=build /app/publish .

# Comando de boot
ENTRYPOINT ["dotnet", "definance-backend.dll"]
