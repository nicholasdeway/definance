using System.Security.Claims;
using definance_backend.Features.WhatsApp.Services;
using definance_backend.Features.WhatsApp.DTOs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace definance_backend.Features.WhatsApp.Controllers
{
    [ApiController]
    [Route("api/whatsapp")]
    public class WhatsAppController : ControllerBase
    {
        private readonly IWhatsAppService _whatsAppService;
        private readonly ILogger<WhatsAppController> _logger;
        private static readonly System.Collections.Concurrent.ConcurrentDictionary<string, DateTime> ProcessedMessages = new();

        public WhatsAppController(IWhatsAppService whatsAppService, ILogger<WhatsAppController> logger)
        {
            _whatsAppService = whatsAppService;
            _logger = logger;
        }

        [Authorize]
        [HttpPost("generate-code")]
        public async Task<IActionResult> GenerateCode()
        {
            var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!Guid.TryParse(userIdStr, out var userId))
                return Unauthorized();

            var result = await _whatsAppService.GeneratePairingCodeAsync(userId);
            return Ok(result);
        }

        [Authorize]
        [HttpGet("status")]
        public async Task<IActionResult> GetStatus()
        {
            var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!Guid.TryParse(userIdStr, out var userId))
                return Unauthorized();

            var status = await _whatsAppService.GetPairingStatusAsync(userId);
            return Ok(status);
        }

        [AllowAnonymous]
        [HttpPost("webhook")]
        public async Task<IActionResult> ZApiWebhook([FromBody] ZApiWebhookDto payload)
        {
            if (payload == null)
            {
                return BadRequest();
            }

            var from = payload.Phone ?? payload.Data?.Phone;
            var body = payload.Text?.Message ?? payload.Message ?? payload.Data?.Text?.Message ?? payload.Data?.Message ?? "";
            var mediaUrl = payload.Audio?.AudioUrl ?? payload.Audio?.MediaUrl ?? payload.Audio?.Url ?? 
                           payload.Data?.Audio?.AudioUrl ?? payload.Data?.Audio?.MediaUrl ?? payload.Data?.Audio?.Url ?? "";
            var messageSid = payload.MessageId ?? payload.ZaapId ?? payload.Id ?? 
                             payload.Data?.MessageId ?? payload.Data?.ZaapId ?? payload.Data?.Id;

            if (!string.IsNullOrEmpty(messageSid))
            {
                // Limpa chaves com mais de 10 minutos
                var cutoff = DateTime.UtcNow.Subtract(TimeSpan.FromMinutes(10));
                foreach (var kvp in ProcessedMessages)
                {
                    if (kvp.Value < cutoff)
                    {
                        ProcessedMessages.TryRemove(kvp.Key, out _);
                    }
                }

                if (!ProcessedMessages.TryAdd(messageSid, DateTime.UtcNow))
                {
                    _logger.LogWarning("Mensagem com MessageId {MessageId} duplicada ignorada (provável retry do webhook).", messageSid);
                    return Ok();
                }
            }

            if (string.IsNullOrEmpty(from))
            {
                _logger.LogWarning("Z-API Webhook recebido sem número de remetente (Phone).");
                return BadRequest();
            }

            // Se for nota de voz/áudio, o Body pode vir vazio, mas temos o mediaUrl
            if (string.IsNullOrEmpty(body) && !string.IsNullOrEmpty(mediaUrl))
            {
                body = "";
            }
            else if (string.IsNullOrEmpty(body))
            {
                _logger.LogWarning("Z-API Webhook recebido sem conteúdo de mensagem ou áudio.");
                return BadRequest();
            }
            
            await _whatsAppService.HandleZApiWebhookAsync(from, body, string.IsNullOrEmpty(mediaUrl) ? null : mediaUrl);
            return Ok();
        }
    }
}