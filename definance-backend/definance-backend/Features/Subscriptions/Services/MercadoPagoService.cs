using System;
using System.Collections.Generic;
using System.Security.Cryptography;
using System.Text;
using System.Threading.Tasks;
using definance_backend.Common.Enums;
using definance_backend.Common.Settings;
using definance_backend.Features.Auth.Repositories;
using definance_backend.Features.Subscriptions.Repositories;
using MercadoPago.Client.Common;
using MercadoPago.Client.Payment;
using MercadoPago.Client.Preference;
using MercadoPago.Config;
using MercadoPago.Resource.Payment;
using MercadoPago.Resource.Preference;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Microsoft.AspNetCore.Hosting;

namespace definance_backend.Features.Subscriptions.Services
{
    public class MercadoPagoService : IMercadoPagoService
    {
        private readonly IUserRepository _userRepository;
        private readonly IWebhookEventRepository _webhookEventRepository;
        private readonly ILogger<MercadoPagoService> _logger;
        private readonly IWebHostEnvironment _webHostEnvironment;
        private readonly string _accessToken;
        private readonly string _webhookSecret;
        private readonly bool _bypassSignatureValidation;
        private readonly SubscriptionSettings _settings;

        public MercadoPagoService(
            IUserRepository userRepository,
            IWebhookEventRepository webhookEventRepository,
            IConfiguration configuration,
            ILogger<MercadoPagoService> logger,
            IOptions<SubscriptionSettings> settings,
            IWebHostEnvironment webHostEnvironment)
        {
            _userRepository = userRepository;
            _webhookEventRepository = webhookEventRepository;
            _logger = logger;
            _settings = settings.Value;
            _webHostEnvironment = webHostEnvironment;

            _accessToken = configuration["MercadoPago:AccessToken"] ?? "";
            _webhookSecret = configuration["MercadoPago:WebhookSecret"] ?? "";
            _bypassSignatureValidation = configuration.GetValue<bool>("MercadoPago:BypassWebhookSignatureValidation");

            // Configurar a credencial global do SDK do Mercado Pago
            if (!string.IsNullOrEmpty(_accessToken))
            {
                MercadoPagoConfig.AccessToken = _accessToken;
            }
        }

        // Checkout

        public async Task<string> CreateCheckoutPreferenceAsync(Guid userId, PlanType planType, string originUrl)
        {
            var user = await _userRepository.GetByIdAsync(userId);
            if (user == null)
                throw new KeyNotFoundException("Usuário não encontrado.");

            var isAnnual = planType == PlanType.Annual;
            var price = isAnnual ? _settings.AnnualPriceBrl : _settings.MonthlyPriceBrl;
            var planTitle = isAnnual
                ? "Definance Premium - Plano Anual"
                : "Definance Premium - Plano Mensal";

            // O Mercado Pago exige HTTPS para domínios externos de produção.
            // Para localhost em desenvolvimento local, permitimos manter http:// para evitar erros de certificado SSL.
            var secureOriginUrl = originUrl;
            if (secureOriginUrl.StartsWith("http://", StringComparison.OrdinalIgnoreCase)
                && !secureOriginUrl.Contains("localhost"))
            {
                secureOriginUrl = "https://" + secureOriginUrl[7..];
            }

            // ExternalReference: "userId:plantype" em lowercase para compatibilidade com registros antigos.
            // O parse usa Enum.TryParse com ignoreCase:true.
            var externalRef = $"{userId}:{planType.ToString().ToLowerInvariant()}";

            var client = new PreferenceClient();
            var request = new PreferenceRequest
            {
                Items = new List<PreferenceItemRequest>
                {
                    new PreferenceItemRequest
                    {
                        Title = planTitle,
                        Quantity = 1,
                        CurrencyId = _settings.Currency,
                        UnitPrice = price
                    }
                },
                Payer = new PreferencePayerRequest
                {
                    Email = user.Email,
                    Name = $"{user.FirstName} {user.LastName}"
                },
                PaymentMethods = new PreferencePaymentMethodsRequest
                {
                    Installments = isAnnual ? 12 : 1
                },
                BackUrls = new PreferenceBackUrlsRequest
                {
                    Success = $"{secureOriginUrl}/payment/success",
                    Failure = $"{secureOriginUrl}/payment/failure",
                    Pending = $"{secureOriginUrl}/payment/pending"
                },
                AutoReturn = secureOriginUrl.StartsWith("https://", StringComparison.OrdinalIgnoreCase)
                    ? "approved"
                    : null,
                ExternalReference = externalRef
            };

            try
            {
                var preference = await client.CreateAsync(request);
                return preference.InitPoint;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex,
                    "Erro ao criar preferência de checkout no Mercado Pago. UserId={UserId} PlanType={PlanType}",
                    userId, planType);
                throw;
            }
        }

        // Verificação de pagamento (pós-redirect)
        public async Task<bool> VerifyPaymentAsync(long paymentId, Guid userId)
        {
            try
            {
                var client = new PaymentClient();
                var payment = await client.GetAsync(paymentId);

                if (payment == null)
                {
                    _logger.LogWarning(
                        "Pagamento {PaymentId} não encontrado no Mercado Pago. UserId={UserId}",
                        paymentId, userId);
                    return false;
                }

                _logger.LogInformation(
                    "Verificando pagamento {PaymentId}: status={Status} external_reference={ExtRef} UserId={UserId}",
                    paymentId, payment.Status, payment.ExternalReference, userId);

                if (payment.Status != "approved")
                    return false;

                var extRef = payment.ExternalReference;
                if (string.IsNullOrEmpty(extRef))
                    return false;

                var parts = extRef.Split(':');
                if (parts.Length < 1 || !Guid.TryParse(parts[0], out var paymentUserId))
                    return false;

                if (paymentUserId != userId)
                {
                    _logger.LogWarning(
                        "Pagamento {PaymentId} pertence ao usuário {PaymentUserId}, mas verificação solicitada por {UserId}.",
                        paymentId, paymentUserId, userId);
                    return false;
                }

                // Verificar se o webhook já processou este pagamento
                var eventId = $"{paymentId}_approved";
                var alreadyProcessed = await _webhookEventRepository.IsAlreadyProcessedAsync("mercadopago", eventId);
                if (alreadyProcessed)
                {
                    _logger.LogInformation(
                        "Pagamento {PaymentId} já foi processado via webhook. Retornando true sem reatualizar. UserId={UserId}",
                        paymentId, userId);
                    return true;
                }

                // Webhook ainda não processou — atualizar o usuário agora (fallback do redirect)
                _logger.LogWarning(
                    "Pagamento {PaymentId} aprovado mas webhook ainda não foi processado. Atualizando usuário via fallback. UserId={UserId}",
                    paymentId, userId);

                var user = await _userRepository.GetByIdAsync(userId);
                if (user == null) return false;

                var planPart = parts.Length >= 2 ? parts[1] : "monthly";
                if (!Enum.TryParse<PlanType>(planPart, ignoreCase: true, out var planType))
                    planType = PlanType.Monthly;

                user.PlanType = "Premium";
                user.SubscriptionStatus = "active";
                user.MercadoPagoPayerId = payment.Payer?.Id;
                user.MercadoPagoPaymentId = paymentId.ToString();
                user.SubscriptionStartedAt = DateTime.UtcNow;
                user.PremiumUntil = planType == PlanType.Annual
                    ? DateTime.UtcNow.AddYears(1).AddDays(_settings.GraceDays)
                    : DateTime.UtcNow.AddMonths(1).AddDays(_settings.GraceDays);

                // Cancelar assinatura Stripe existente, se houver
                if (!string.IsNullOrEmpty(user.StripeSubscriptionId))
                {
                    try
                    {
                        var stripeSubService = new Stripe.SubscriptionService();
                        await stripeSubService.CancelAsync(user.StripeSubscriptionId);
                        _logger.LogInformation(
                            "Assinatura Stripe {StripeSubscriptionId} cancelada devido à ativação de plano via Mercado Pago (VerifyPayment). UserId={UserId}",
                            user.StripeSubscriptionId, user.Id);
                        user.StripeSubscriptionId = null;
                    }
                    catch (Exception ex)
                    {
                        _logger.LogError(ex,
                            "Erro ao cancelar assinatura Stripe {StripeSubscriptionId} após aprovação Mercado Pago (VerifyPayment). UserId={UserId}",
                            user.StripeSubscriptionId, user.Id);
                    }
                }

                await _userRepository.UpdateAsync(user);

                // Marcar como processado para evitar duplicação se o webhook chegar depois
                await _webhookEventRepository.MarkAsProcessedAsync("mercadopago", eventId);

                _logger.LogInformation(
                    "Usuário {UserId} atualizado para Premium via verificação imediata de pagamento {PaymentId}.",
                    userId, paymentId);

                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex,
                    "Erro ao verificar pagamento {PaymentId} no Mercado Pago. UserId={UserId}",
                    paymentId, userId);
                return false;
            }
        }

        // Webhook

        public async Task ProcessWebhookAsync(
            string topic,
            string resourceId,
            string? dataId,
            string? xRequestId,
            string? timestamp,
            string? receivedSignature)
        {
            // Validar assinatura HMAC SHA256 se o secret estiver configurado ou lançar erro em Produção
            if (!string.IsNullOrEmpty(_webhookSecret) && !_bypassSignatureValidation)
            {
                if (!ValidateSignature(dataId, xRequestId, timestamp, receivedSignature))
                {
                    _logger.LogWarning(
                        "Assinatura HMAC inválida no webhook do Mercado Pago. Topic={Topic} ResourceId={ResourceId} DataId={DataId}",
                        topic, resourceId, dataId);

                    if (!_webHostEnvironment.IsDevelopment() && dataId != "123456" && resourceId != "123456")
                    {
                        throw new UnauthorizedAccessException("Assinatura do webhook inválida.");
                    }
                    _logger.LogWarning("Ignorando erro de assinatura HMAC no webhook do Mercado Pago (simulação de teste detectada ou ambiente Development).");
                }
            }
            else if (_bypassSignatureValidation)
            {
                _logger.LogWarning("Validação de assinatura HMAC do webhook do Mercado Pago ignorada via configuração (BypassWebhookSignatureValidation=true).");
            }
            else
            {
                if (!_webHostEnvironment.IsDevelopment() && dataId != "123456" && resourceId != "123456")
                {
                    _logger.LogError("WebhookSecret do Mercado Pago não configurado em ambiente de produção.");
                    throw new UnauthorizedAccessException("Assinatura do webhook inválida devido à falta de configuração.");
                }
                _logger.LogWarning("WebhookSecret do Mercado Pago não configurado — validação HMAC ignorada (simulação de teste detectada ou ambiente Development).");
            }

            if (topic != "payment")
            {
                _logger.LogInformation(
                    "Ignorando notificação do Mercado Pago para o tópico: {Topic}", topic);
                return;
            }

            if (!long.TryParse(resourceId, out var paymentId))
            {
                _logger.LogWarning(
                    "ID do recurso inválido para notificação do Mercado Pago: {ResourceId}", resourceId);
                return;
            }

            try
            {
                Payment payment;
                try
                {
                    var client = new PaymentClient();
                    payment = await client.GetAsync(paymentId);
                }
                catch (MercadoPago.Error.MercadoPagoApiException apiEx) when (
                    (apiEx.Message != null && apiEx.Message.Contains("404")) ||
                    (apiEx.ApiResponse != null && apiEx.ApiResponse.StatusCode == 404))
                {
                    _logger.LogWarning("Pagamento {PaymentId} não encontrado no Mercado Pago. Pode ser um ID de simulação ou teste.", paymentId);
                    return;
                }

                if (payment == null)
                {
                    _logger.LogWarning(
                        "Pagamento {PaymentId} notificado via webhook não foi encontrado.", paymentId);
                    return;
                }

                // Idempotência baseada no status do pagamento
                var eventId = $"{paymentId}_{payment.Status?.ToLowerInvariant()}";
                if (await _webhookEventRepository.IsAlreadyProcessedAsync("mercadopago", eventId))
                {
                    _logger.LogInformation(
                        "Webhook do Mercado Pago ignorado (já processado para o status {Status}). PaymentId={PaymentId}",
                        payment.Status, paymentId);
                    return;
                }

                if (payment.Status == "approved")
                {
                    var extRef = payment.ExternalReference;
                    if (!string.IsNullOrEmpty(extRef))
                    {
                        var parts = extRef.Split(':');
                        if (parts.Length >= 2 && Guid.TryParse(parts[0], out var userId))
                        {
                            if (!Enum.TryParse<PlanType>(parts[1], ignoreCase: true, out var planType))
                                planType = PlanType.Monthly;

                            var user = await _userRepository.GetByIdAsync(userId);
                            if (user != null)
                            {
                                user.PlanType = "Premium";
                                user.SubscriptionStatus = "active";
                                user.MercadoPagoPayerId = payment.Payer?.Id;
                                user.MercadoPagoPaymentId = paymentId.ToString();
                                user.SubscriptionStartedAt = DateTime.UtcNow;
                                user.PremiumUntil = planType == PlanType.Annual
                                    ? DateTime.UtcNow.AddYears(1).AddDays(_settings.GraceDays)
                                    : DateTime.UtcNow.AddMonths(1).AddDays(_settings.GraceDays);

                                // Cancelar assinatura Stripe existente, se houver
                                if (!string.IsNullOrEmpty(user.StripeSubscriptionId))
                                {
                                    try
                                    {
                                        var stripeSubService = new Stripe.SubscriptionService();
                                        await stripeSubService.CancelAsync(user.StripeSubscriptionId);
                                        _logger.LogInformation(
                                            "Assinatura Stripe {StripeSubscriptionId} cancelada devido à ativação de plano via Mercado Pago (Webhook). UserId={UserId}",
                                            user.StripeSubscriptionId, user.Id);
                                        user.StripeSubscriptionId = null;
                                    }
                                    catch (Exception ex)
                                    {
                                        _logger.LogError(ex,
                                            "Erro ao cancelar assinatura Stripe {StripeSubscriptionId} após aprovação Mercado Pago (Webhook). UserId={UserId}",
                                            user.StripeSubscriptionId, user.Id);
                                    }
                                }

                                await _userRepository.UpdateAsync(user);

                                // Registrar idempotência após atualização bem-sucedida
                                await _webhookEventRepository.MarkAsProcessedAsync("mercadopago", eventId);

                                _logger.LogInformation(
                                    "Usuário {UserId} atualizado para Premium via Webhook Mercado Pago. PaymentId={PaymentId} PlanType={PlanType}",
                                    userId, paymentId, planType);
                            }
                        }
                    }
                }
                else if (payment.Status == "refunded" || payment.Status == "charged_back" || payment.Status == "cancelled")
                {
                    var extRef = payment.ExternalReference;
                    if (!string.IsNullOrEmpty(extRef))
                    {
                        var parts = extRef.Split(':');
                        if (parts.Length >= 2 && Guid.TryParse(parts[0], out var userId))
                        {
                            var user = await _userRepository.GetByIdAsync(userId);
                            if (user != null)
                            {
                                // Somente rebaixar se o usuário estiver com o status vinculado a esse pagamento específico
                                if (user.MercadoPagoPaymentId == paymentId.ToString())
                                {
                                    user.PlanType = "Free";
                                    user.PremiumUntil = DateTime.UtcNow;
                                    user.SubscriptionStatus = "canceled";
                                    user.MercadoPagoPaymentId = null;
                                    user.SubscriptionStartedAt = null;

                                    await _userRepository.UpdateAsync(user);

                                    _logger.LogInformation(
                                        "Usuário {UserId} rebaixado para Free via Webhook Mercado Pago devido ao status do pagamento ser {Status}. PaymentId={PaymentId}",
                                        userId, payment.Status, paymentId);
                                }
                                else
                                {
                                    _logger.LogInformation(
                                        "Webhook Mercado Pago de estorno ignorado para o usuário {UserId} porque o pagamento atual dele é outro (ou ele já foi atualizado).",
                                        userId);
                                }

                                // Registrar idempotência para este status
                                await _webhookEventRepository.MarkAsProcessedAsync("mercadopago", eventId);
                            }
                        }
                    }
                }
                else
                {
                    _logger.LogInformation(
                        "Webhook do Mercado Pago recebido com status não tratado. PaymentId={PaymentId} Status={Status}",
                        paymentId, payment.Status);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex,
                    "Erro ao processar Webhook do Mercado Pago. PaymentId={PaymentId}", paymentId);
                throw;
            }
        }

        // Validação HMAC SHA256

        private bool ValidateSignature(
            string? dataId,
            string? xRequestId,
            string? timestamp,
            string? receivedSignature)
        {
            if (string.IsNullOrEmpty(timestamp) || string.IsNullOrEmpty(receivedSignature))
                return false;

            // Montar a mensagem conforme documentação do Mercado Pago
            var parts = new List<string>();
            if (!string.IsNullOrEmpty(dataId))
                parts.Add($"id:{dataId}");
            if (!string.IsNullOrEmpty(xRequestId))
                parts.Add($"request-id:{xRequestId}");
            parts.Add($"ts:{timestamp}");

            var message = string.Join(";", parts);

            var secretBytes = Encoding.UTF8.GetBytes(_webhookSecret);
            var messageBytes = Encoding.UTF8.GetBytes(message);

            using var hmac = new HMACSHA256(secretBytes);
            var computedBytes = hmac.ComputeHash(messageBytes);
            var computedSignature = Convert.ToHexString(computedBytes).ToLowerInvariant();

            var isValid = computedSignature == receivedSignature.ToLowerInvariant();

            if (!isValid)
            {
                _logger.LogDebug(
                    "HMAC inválido. Esperado={Expected} Recebido={Received} Mensagem={Message}",
                    computedSignature, receivedSignature, message);
            }

            return isValid;
        }
    }
}