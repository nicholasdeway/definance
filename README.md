# Definance - Gestão Financeira

Bem-vindo ao repositório oficial da API do **Definance**! Esta é uma aplicação backend robusta e superdimensionada desenvolvida em **C# (.NET Core)** para controle e gestão financeira com controle de usuários e segurança de acessos.

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
