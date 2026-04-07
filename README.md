# 🚀 Definance Backend (API)

Bem-vindo ao repositório oficial da API do **Definance**! Esta é uma aplicação backend robusta e superdimensionada desenvolvida em **C# (.NET Core)** para controle e gestão financeira com altíssimo controle de usuários e segurança de acessos.

## 🛠️ Tecnologias e Arquitetura 

Todo o fluxo foi planejado focado em Clean Code, Injeção de Dependência nativa e performance de persistência. O banco principal é totalmente gerido via Supabase.

*   **Linguagem & Framework:** C# 12 / ASP.NET Core 8.0
*   **Banco de Dados:** PostgreSQL hospedado nativamente no [Supabase](https://supabase.com).
*   **Micro-ORM:** [Dapper](https://github.com/DapperLib/Dapper) - Escolhido pela alta taxa de I/O em leitura crua para o Postgre.
*   **Autenticação & Segurança:** 
    *   JWT (JSON Web Keys) + Autenticação local em banco isolado.
    *   Integração OAuth nativa para **Google Sign-In**.
    *   Cookies `HttpOnly` para o bloqueio de roubos XSS por frontends. 
    *   Hash seguro militar com `BCrypt.Net`.
*   **Envio de E-mail:** Interface REST nativa via SDK customizado para a plataforma [MailerSend](https://www.mailersend.com/) (Tokens randômicos + expiração via DB).
*   **Validação de Payload:** [FluentValidation](https://docs.fluentvalidation.net/) - Filtragem de lixo anti-spam nos Request DTOs.
*   **Formatação:** Utilitários próprios em C# (Injeções) garantindo sanitização e Formatação Invariante nos bancos `ToLowerInvariant()`.

---

## 🏗 Estrutura do Projeto (Feature-Slice)

Nossa pasta se baseia numa variação agressiva e limpa de divisão por recursos (*Features*). É mais escalável que o famoso padrão MVC convencional.
```text
📦 definance-backend
 ┣ 📂 Common (Contratos universais, Helpers, Settings IOptions)
 ┣ 📂 Domain (Entidades físicas que refletem rigorosamente o Banco de Dados)
 ┣ 📂 Features
 ┃  ┣ 📂 Auth (Controllers, DTOs, Repositórios e Serviços de registro/Login)
 ┃  ┗ 📂 Profiles (Acesso, edição e deleção contínua da conta do usuário logado)
 ┣ 📂 Services (Serviços e conetores externos, como envio HTTP para a MailerSend API)
 ┣ 📜 Program.cs (Injeção de dependências e configuração dos Pipelines/Middlewares da Microsoft)
```

---

## ⚙️ Pré-requisitos para Iniciar

É muito fácil clonar e subir o projeto:

1. **[.NET 8.0 SDK](https://dotnet.microsoft.com/download)** instalado.
2. Banco de dados **PostgreSQL** (Preferencialmente configurando as Keys para o seu [Supabase](https://supabase.com) Account).
3. Criação do arquivo de chaves de aplicativo (`appsettings.json` local). Devido à sensibilidade do JWT/MaiilSend/Google, não enviamos os secrets pro ar!

---

## 🚀 Como Rodar Localmente

1. Clone o pacote do GitHub:
   ```bash
   git clone https://github.com/SEU-USUARIO/definance-backend.git
   cd definance-backend
   ```
2. Restaure os pacotes C# principais:
   ```bash
   dotnet restore
   ```
3. Crie um arquivo `appsettings.Development.json` na raiz ao lado do `Program.cs` com suas variáveis espelho (Se já clonou, edite as Connection Strings).

4. Suba o servidor de desenvolvimento:
   ```bash
   dotnet run
   ```

Tudo pronto! Você pode usar a interface rica do `Swagger` ao acessar `https://localhost:7198/swagger/index.html` ou as URLs expostas em tela!

---

## 🔒 Mecanismo de Redefinição de Senha

O sistema lida com resgate de contas de forma impenetrável sem necessidade imediata de Frontend para disparar Tokens:
1. `POST /api/auth/password-reset/request` (Envia link para Google + Gera Código Aleatório interno).
2. O código ganha `Timestamptz` por 24h e flui via E-mail pra mão do cliente.
3. Consumo na rota `POST /api/auth/password-reset/confirm` e finalização hash!

## 💡 Próximos Passos (Backlog Oficial)

- [ ] Construir Rotas Financeiras (`Transactions`) para os CRUDs de receitas, limites e dívidas fixas do mês.
- [ ] Construir a Integração IA da OpenAI para analisar padrões de dívidas e projetar sugestões e metas.