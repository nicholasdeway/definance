using System.Threading.Tasks;
using System.Text.RegularExpressions;
using definance_backend.Domain.Entities;
using definance_backend.Features.WhatsApp.DTOs;
using definance_backend.Features.WhatsApp.Repositories;
using Twilio;
using Twilio.Rest.Api.V2010.Account;
using Twilio.Types;
using System.Text.Json;
using System.Text;

namespace definance_backend.Features.WhatsApp.Services
{
    public class WhatsAppService : IWhatsAppService
    {
        private readonly IWhatsAppRepository _repository;
        private readonly IConfiguration _configuration;
        private readonly HttpClient _httpClient;
        private readonly ILogger<WhatsAppService> _logger;

        public WhatsAppService(
            IWhatsAppRepository repository, 
            IConfiguration configuration,
            HttpClient httpClient,
            ILogger<WhatsAppService> logger)
        {
            _repository = repository;
            _configuration = configuration;
            _httpClient = httpClient;
            _logger = logger;

            var accountSid = _configuration["Twilio:AccountSID"];
            var authToken = _configuration["Twilio:AuthToken"];
            
            if (!string.IsNullOrEmpty(accountSid) && !string.IsNullOrEmpty(authToken))
            {
                TwilioClient.Init(accountSid, authToken);
            }
        }

        public async Task<WhatsAppPairingResponseDto> GeneratePairingCodeAsync(Guid userId)
        {
            var activePairing = await _repository.GetActivePairingByUserIdAsync(userId);
            
            if (activePairing != null)
            {
                return new WhatsAppPairingResponseDto
                {
                    Code = activePairing.Code,
                    Status = activePairing.Status,
                    ExpiresAt = activePairing.ExpiresAt
                };
            }

            var random = new Random();
            var code = $"WAUTH-{random.Next(1000000, 9999999)}";

            var pairing = new WhatsAppPairing
            {
                Id = Guid.NewGuid(),
                UserId = userId,
                Code = code,
                Status = "Pending",
                ExpiresAt = DateTime.UtcNow.AddMinutes(15),
                CreatedAt = DateTime.UtcNow
            };

            await _repository.CreatePairingAsync(pairing);

            return new WhatsAppPairingResponseDto
            {
                Code = pairing.Code,
                Status = pairing.Status,
                ExpiresAt = pairing.ExpiresAt
            };
        }

        public async Task<WhatsAppPairingResponseDto> GetPairingStatusAsync(Guid userId)
        {
            // 1. PRIORIDADE: verifica se há um código pendente ativo
            var activePairing = await _repository.GetActivePairingByUserIdAsync(userId);
            if (activePairing != null)
            {
                return new WhatsAppPairingResponseDto
                {
                    Code = activePairing.Code,
                    Status = activePairing.Status,
                    ExpiresAt = activePairing.ExpiresAt
                };
            }

            // 2. Sem código pendente: verifica se o usuário já está conectado
            var currentUser = await _repository.GetUserByIdAsync(userId);
            if (currentUser?.IsWhatsAppConnected == true)
            {
                return new WhatsAppPairingResponseDto
                {
                    Code = string.Empty,
                    Status = "Connected",
                    ExpiresAt = DateTime.UtcNow.AddYears(1)
                };
            }

            // 3. Padrão: Não conectado e sem código ativo
            return new WhatsAppPairingResponseDto
            {
                Code = string.Empty,
                Status = "NotConnected",
                ExpiresAt = DateTime.UtcNow
            };
        }

        public async Task HandleTwilioWebhookAsync(string fromPhone, string body)
        {
            try 
            {
                // Normalização universal E.164 (+DDI...)
                var digitsOnly = Regex.Replace(fromPhone.Replace("whatsapp:", ""), @"\D", "");
                var normalizedPhone = "+" + digitsOnly;
                var text = body.Trim();

                // 1. Check if it's a pairing code
                var codeMatch = Regex.Match(text, @"WAUTH-\d{7}", RegexOptions.IgnoreCase);
                
                if (codeMatch.Success)
                {
                    var code = codeMatch.Value.ToUpper();
                    var pairing = await _repository.GetPairingByCodeAsync(code);

                    if (pairing != null && pairing.Status == "Pending" && pairing.ExpiresAt > DateTime.UtcNow)
                    {

                        // 1. Verificar se este número já está sendo usado por OUTRA conta
                        var existingUser = await _repository.GetUserByPhoneAsync(normalizedPhone);
                        if (existingUser != null && existingUser.Id != pairing.UserId)
                        {
                            _logger.LogWarning("Tentativa de vincular número {Phone} que já pertence ao usuário {UserId}", normalizedPhone, existingUser.Id);
                            
                            await SendWhatsAppMessageAsync(fromPhone, 
                                "⚠️ Este número de WhatsApp já está vinculado a outra conta no Definance.\n\n" +
                                "Por motivos de segurança, cada número só pode ser usado em uma conta por vez.");
                            return;
                        }

                        // 2. Se estiver livre ou for o mesmo usuário, prossegue com o vínculo
                        pairing.Status = "Connected";
                        await _repository.UpdatePairingAsync(pairing);
                        await _repository.UpdateUserPhoneAsync(pairing.UserId, normalizedPhone);

                        await SendWhatsAppMessageAsync(fromPhone, "✅ Bem-vindo ao Definance! Seu WhatsApp foi conectado com sucesso.");
                        return;
                    }
                    else if (pairing != null && pairing.ExpiresAt <= DateTime.UtcNow)
                    {
                        await SendWhatsAppMessageAsync(fromPhone, "❌ Este código de pareamento expirou. Por favor, gere um novo código na plataforma.");
                        return;
                    }
                    else
                    {
                        await SendWhatsAppMessageAsync(fromPhone, "❌ Código de pareamento inválido ou já utilizado.");
                        return;
                    }
                }

                // 2. If it's not a code, check if user exists
                var user = await _repository.GetUserByPhoneAsync(normalizedPhone);
                if (user == null)
                {
                    await SendWhatsAppMessageAsync(fromPhone, "❌ Número não reconhecido. Acesse sua conta no Definance (https://definance.com.br) e gere um código de pareamento.");
                    return;
                }

                // 3. Send to AI Service
                await ForwardToAIServiceAsync(user.Id, normalizedPhone, text);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error handling Twilio webhook");
            }
        }

        private async Task SendWhatsAppMessageAsync(string to, string message)
        {
            var twilioNumber = _configuration["Twilio:PhoneNumber"];
            
            if (string.IsNullOrEmpty(twilioNumber))
            {
                _logger.LogWarning("Twilio phone number is not configured.");
                return;
            }

            // Must include whatsapp: prefix and a '+' sign before the number if it doesn't have one
            var rawTo = to.Replace("whatsapp:", "").Trim();
            if (!rawTo.StartsWith("+")) rawTo = "+" + rawTo;
            var toNum = $"whatsapp:{rawTo}";

            var rawFrom = twilioNumber.Replace("whatsapp:", "").Trim();
            if (!rawFrom.StartsWith("+")) rawFrom = "+" + rawFrom;
            var fromNum = $"whatsapp:{rawFrom}";

            try
            {
                await MessageResource.CreateAsync(
                    body: message,
                    from: new PhoneNumber(fromNum),
                    to: new PhoneNumber(toNum)
                );
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to send WhatsApp message");
            }
        }

        private async Task ForwardToAIServiceAsync(Guid userId, string phone, string message)
        {
            var aiEndpoint = _configuration["AIService:Endpoint"] ?? "http://localhost:8000/api/chat";
            
            var payload = new 
            {
                user_id = userId.ToString(),
                phone_number = phone,
                message = message
            };

            try 
            {
                var content = new StringContent(JsonSerializer.Serialize(payload), Encoding.UTF8, "application/json");
                var response = await _httpClient.PostAsync(aiEndpoint, content);
                
                if (response.IsSuccessStatusCode)
                {
                    var result = await response.Content.ReadAsStringAsync();
                    using var doc = JsonDocument.Parse(result);
                    if (doc.RootElement.TryGetProperty("reply", out var replyElement))
                    {
                        var reply = replyElement.GetString();
                        if (!string.IsNullOrEmpty(reply))
                        {
                            await SendWhatsAppMessageAsync(phone, reply);
                        }
                    }
                }
                else
                {
                    _logger.LogError($"AI Service returned {response.StatusCode}");
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to communicate with AI Service");
            }
        }

        public async Task<User?> GetUserByIdAsync(Guid userId)
        {
            return await _repository.GetUserByIdAsync(userId);
        }
    }
}