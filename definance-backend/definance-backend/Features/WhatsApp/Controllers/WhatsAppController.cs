using System.Security.Claims;
using definance_backend.Features.WhatsApp.Services;
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
        public async Task<IActionResult> TwilioWebhook([FromForm] IFormCollection form)
        {
            var from = form["From"].ToString();
            var body = form["Body"].ToString();
            var mediaUrl = form["MediaUrl0"].ToString();

            if (string.IsNullOrEmpty(from))
            {
                return BadRequest();
            }

            // Se for nota de voz/áudio, o Body pode vir vazio, mas temos o mediaUrl
            if (string.IsNullOrEmpty(body) && !string.IsNullOrEmpty(mediaUrl))
            {
                body = "";
            }
            else if (string.IsNullOrEmpty(body))
            {
                return BadRequest();
            }
            
            await _whatsAppService.HandleTwilioWebhookAsync(from, body, string.IsNullOrEmpty(mediaUrl) ? null : mediaUrl);
            return Content("<Response></Response>", "text/xml");
        }
    }
}