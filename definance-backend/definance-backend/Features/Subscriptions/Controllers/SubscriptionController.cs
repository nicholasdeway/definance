using System;
using System.IO;
using System.Security.Claims;
using System.Threading.Tasks;
using definance_backend.Common;
using definance_backend.Features.Subscriptions.Services;
using definance_backend.Features.Subscriptions.DTOs;
using definance_backend.Features.Auth.Repositories;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Stripe;
using Stripe.Checkout;

namespace definance_backend.Features.Subscriptions.Controllers
{
    [Authorize]
    public class SubscriptionController : BaseApiController
    {
        private readonly ISubscriptionService _subscriptionService;
        private readonly IUserRepository _userRepository;
        private readonly IConfiguration _configuration;
        private readonly ILogger<SubscriptionController> _logger;
        private readonly IMercadoPagoService _mercadoPagoService;
        private readonly string _frontendBaseUrl;

        public SubscriptionController(
            ISubscriptionService subscriptionService,
            IUserRepository userRepository,
            IConfiguration configuration,
            ILogger<SubscriptionController> logger,
            IMercadoPagoService mercadoPagoService)
        {
            _subscriptionService = subscriptionService;
            _userRepository = userRepository;
            _configuration = configuration;
            _logger = logger;
            _mercadoPagoService = mercadoPagoService;
            _frontendBaseUrl = configuration["FrontendBaseUrl"]!;
        }

        // POST /checkout

        [HttpPost("checkout")]
        public async Task<IActionResult> CreateCheckoutSession([FromBody] CheckoutRequest request)
        {
            var traceId = HttpContext.TraceIdentifier;
            try
            {
                var userId = GetUserId();

                var originUrl = request.OriginUrl ?? _frontendBaseUrl;

                var gateway = request.Gateway?.ToLower();
                var useMercadoPago = gateway == "mercadopago"
                    || (string.IsNullOrEmpty(gateway)
                        && _configuration.GetValue<bool>("MercadoPago:Enabled"));

                if (useMercadoPago)
                {
                    var mpUrl = await _mercadoPagoService.CreateCheckoutPreferenceAsync(
                        userId, request.PlanType!.Value, originUrl);
                    return Ok(new { url = mpUrl });
                }

                var checkoutUrl = await _subscriptionService.CreateCheckoutSessionAsync(
                    userId, request.PlanType!.Value, originUrl);
                return Ok(new { url = checkoutUrl });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex,
                    "Erro ao criar checkout session. TraceId={TraceId}",
                    traceId);
                return StatusCode(500, new { message = "Erro interno ao processar requisição." });
            }
        }

        // POST /portal

        [HttpPost("portal")]
        public async Task<IActionResult> CreatePortalSession([FromBody] PortalRequest request)
        {
            var traceId = HttpContext.TraceIdentifier;
            try
            {
                var userId = GetUserId();
                var originUrl = request.OriginUrl ?? _frontendBaseUrl;
                var portalUrl = await _subscriptionService.CreateCustomerPortalSessionAsync(userId, originUrl);
                return Ok(new { url = portalUrl });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex,
                    "Erro ao criar portal session. TraceId={TraceId}",
                    traceId);
                return StatusCode(500, new { message = "Erro interno ao processar requisição." });
            }
        }

        // POST /verify-session

        [HttpPost("verify-session")]
        public async Task<IActionResult> VerifySession([FromBody] VerifySessionRequest request)
        {
            var traceId = HttpContext.TraceIdentifier;
            try
            {
                var userId = GetUserId();

                // ── Branch Mercado Pago 
                if (!string.IsNullOrEmpty(request.PaymentId))
                {
                    if (!long.TryParse(request.PaymentId, out var paymentIdLong))
                        return BadRequest(new { message = "ID de pagamento inválido." });

                    var isMercadoPagoPaid = await _mercadoPagoService.VerifyPaymentAsync(paymentIdLong, userId);
                    return Ok(new { isPaid = isMercadoPagoPaid });
                }

                // ── Branch Stripe (somente leitura) 
                if (string.IsNullOrEmpty(request.SessionId))
                    return BadRequest(new { message = "O ID da sessão é obrigatório." });

                var sessionService = new SessionService();
                var session = await sessionService.GetAsync(request.SessionId);

                if (session == null)
                    return NotFound(new { message = "Sessão não encontrada." });

                var isPaid = session.PaymentStatus == "paid";

                // Consultar o estado atual do usuário no banco (atualizado pelo webhook)
                var user = await _userRepository.GetByIdAsync(userId);
                var isAlreadyPremium = user?.IsPremium ?? false;

                if (isPaid && !isAlreadyPremium)
                {
                    // Pagamento confirmado na Stripe, mas o webhook ainda não processou.
                    // O frontend deve fazer polling por alguns segundos.
                    _logger.LogWarning(
                        "Pagamento confirmado na Stripe mas usuário ainda não é Premium — webhook pendente. " +
                        "UserId={UserId} SessionId={SessionId} TraceId={TraceId}",
                        userId, request.SessionId, traceId);
                }

                return Ok(new
                {
                    isPaid,
                    isPremium = isAlreadyPremium,
                    subscriptionStatus = user?.SubscriptionStatus
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex,
                    "Erro ao verificar sessão do Stripe. TraceId={TraceId}",
                    traceId);
                return StatusCode(500, new { message = "Erro ao processar validação da sessão." });
            }
        }

        // POST /webhook (Stripe)

        [HttpPost("webhook")]
        [AllowAnonymous]
        public async Task<IActionResult> StripeWebhook()
        {
            var traceId = HttpContext.TraceIdentifier;
            var json = await new StreamReader(HttpContext.Request.Body).ReadToEndAsync();
            var signatureHeader = Request.Headers["Stripe-Signature"].ToString();
            var webhookSecret = _configuration["Stripe:WebhookSecret"] ?? "";

            if (string.IsNullOrEmpty(signatureHeader) || string.IsNullOrEmpty(webhookSecret))
            {
                _logger.LogWarning(
                    "Webhook Stripe chamado sem assinatura ou secret ausente. TraceId={TraceId}",
                    traceId);
                return BadRequest(new { message = "Assinatura ou secret ausente." });
            }

            try
            {
                await _subscriptionService.ProcessWebhookAsync(json, signatureHeader, webhookSecret);
                return Ok();
            }
            catch (StripeException ex)
            {
                _logger.LogWarning(ex,
                    "Assinatura inválida no Stripe Webhook. TraceId={TraceId}",
                    traceId);
                return BadRequest(new { message = "Assinatura inválida." });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex,
                    "Erro geral no processamento do Stripe Webhook. TraceId={TraceId}",
                    traceId);
                return StatusCode(500, new { message = "Erro interno no servidor." });
            }
        }

        // POST /webhook-mercadopago

        [HttpPost("webhook-mercadopago")]
        [AllowAnonymous]
        public async Task<IActionResult> MercadoPagoWebhook(
            [FromQuery] string? topic,
            [FromQuery] string? id,
            [FromBody] MercadoPagoWebhookBody? body)
        {
            var traceId = HttpContext.TraceIdentifier;
            try
            {
                // Extrair headers de validação HMAC
                var xSignature = Request.Headers["x-signature"].ToString();
                var xRequestId = Request.Headers["x-request-id"].ToString();

                // Parsear timestamp e v1 do header "x-signature: ts=<ts>,v1=<hmac>"
                string? timestamp = null;
                string? v1Signature = null;
                if (!string.IsNullOrEmpty(xSignature))
                {
                    foreach (var part in xSignature.Split(','))
                    {
                        var kv = part.Trim().Split('=', 2);
                        if (kv.Length == 2)
                        {
                            if (kv[0] == "ts") timestamp = kv[1];
                            else if (kv[0] == "v1") v1Signature = kv[1];
                        }
                    }
                }

                var dataId = body?.Data?.Id;

                _logger.LogInformation(
                    "Webhook do Mercado Pago recebido. Topic={Topic} Id={Id} BodyType={BodyType} DataId={DataId} TraceId={TraceId}",
                    topic, id, body?.Type, dataId, traceId);

                var resolvedTopic = topic ?? body?.Type;
                var resolvedResourceId = id ?? dataId;

                if (string.IsNullOrEmpty(resolvedTopic) || string.IsNullOrEmpty(resolvedResourceId))
                {
                    _logger.LogWarning(
                        "Webhook Mercado Pago com parâmetros insuficientes. TraceId={TraceId}",
                        traceId);
                    return BadRequest(new { message = "Tópico ou recurso ausente." });
                }

                await _mercadoPagoService.ProcessWebhookAsync(
                    resolvedTopic,
                    resolvedResourceId,
                    dataId,
                    string.IsNullOrEmpty(xRequestId) ? null : xRequestId,
                    timestamp,
                    v1Signature);

                return Ok();
            }
            catch (UnauthorizedAccessException ex)
            {
                _logger.LogWarning(ex,
                    "Assinatura HMAC inválida no webhook do Mercado Pago. TraceId={TraceId}",
                    traceId);
                return Unauthorized(new { message = "Assinatura inválida." });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex,
                    "Erro ao processar webhook do Mercado Pago. TraceId={TraceId}",
                    traceId);
                return StatusCode(500, new { message = "Erro interno ao processar notificação." });
            }
        }

        // POST /cancel-and-refund 

        [HttpPost("cancel-and-refund")]
        public async Task<IActionResult> CancelAndRefund()
        {
            var traceId = HttpContext.TraceIdentifier;
            try
            {
                var userId = GetUserId();
                await _subscriptionService.CancelAndRefundAsync(userId);
                return Ok(new { message = "Assinatura cancelada e reembolso solicitado com sucesso." });
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (ApplicationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex,
                    "Erro ao processar cancelamento e reembolso. TraceId={TraceId}",
                    traceId);
                return StatusCode(500, new { message = "Erro interno ao processar reembolso." });
            }
        }
    }
}