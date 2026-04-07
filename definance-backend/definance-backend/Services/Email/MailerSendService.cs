using System;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Text.Json;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using definance_backend.Common.Interfaces;

namespace definance_backend.Services.Email
{
    public class MailerSendService : IEmailService
    {
        private readonly HttpClient _httpClient;
        private readonly IConfiguration _configuration;
        private readonly ILogger<MailerSendService> _logger;

        public MailerSendService(HttpClient httpClient, IConfiguration configuration, ILogger<MailerSendService> logger)
        {
            _httpClient = httpClient;
            _configuration = configuration;
            _logger = logger;
        }

        public async Task SendPasswordResetEmailAsync(string toEmail, string resetLink, string userName, string token)
        {
            var apiToken = _configuration["MailerSend:ApiToken"];
            var fromEmail = _configuration["MailerSend:FromEmail"];
            var templateId = _configuration["MailerSend:TemplateId"];

            if (string.IsNullOrWhiteSpace(apiToken) || string.IsNullOrWhiteSpace(fromEmail) || string.IsNullOrWhiteSpace(templateId))
            {
                _logger.LogError("Configurações do MailerSend ausentes no appsettings.json.");
                throw new ApplicationException("Serviço de e-mail não configurado corretamente.");
            }

            var payload = new
            {
                from = new { email = fromEmail },
                to = new[] { new { email = toEmail } },
                subject = "Definance - Instruções de redefinição de senha",
                personalization = new[]
                {
                    new
                    {
                        email = toEmail,
                        data = new
                        {
                            name = userName,
                            reset_link = resetLink,
                            token = token
                        }
                    }
                },
                template_id = templateId
            };

            var request = new HttpRequestMessage(HttpMethod.Post, "https://api.mailersend.com/v1/email")
            {
                Content = new StringContent(JsonSerializer.Serialize(payload), System.Text.Encoding.UTF8, "application/json")
            };

            request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", apiToken);
            request.Headers.Add("X-Requested-With", "XMLHttpRequest");

            var response = await _httpClient.SendAsync(request);

            if (!response.IsSuccessStatusCode)
            {
                var errorBody = await response.Content.ReadAsStringAsync();
                _logger.LogError("Falha ao enviar e-mail via MailerSend. Status: {StatusCode}. Resposta: {ErrorBody}", response.StatusCode, errorBody);
                throw new ApplicationException("Falha ao enviar o e-mail de redefinição de senha.");
            }
        }
    }
}