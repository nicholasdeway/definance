using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using definance_backend.Common.Enums;
using definance_backend.Common.Settings;
using definance_backend.Features.Auth.Repositories;
using definance_backend.Features.Subscriptions.Repositories;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Stripe;
using Stripe.Checkout;

namespace definance_backend.Features.Subscriptions.Services
{
    public class SubscriptionService : ISubscriptionService
    {
        private readonly IUserRepository _userRepository;
        private readonly IWebhookEventRepository _webhookEventRepository;
        private readonly ILogger<SubscriptionService> _logger;
        private readonly string _monthlyPriceId;
        private readonly string _annualPriceId;
        private readonly SubscriptionSettings _settings;

        public SubscriptionService(
            IUserRepository userRepository,
            IWebhookEventRepository webhookEventRepository,
            IConfiguration configuration,
            ILogger<SubscriptionService> logger,
            IOptions<SubscriptionSettings> settings)
        {
            _userRepository = userRepository;
            _webhookEventRepository = webhookEventRepository;
            _logger = logger;
            _settings = settings.Value;
            _monthlyPriceId = configuration["Stripe:MonthlyPriceId"]
                ?? throw new InvalidOperationException("Stripe:MonthlyPriceId não configurado.");
            _annualPriceId = configuration["Stripe:AnnualPriceId"]
                ?? throw new InvalidOperationException("Stripe:AnnualPriceId não configurado.");
        }

        // ── Checkout ─────────────────────────────────────────────────────────────

        public async Task<string> CreateCheckoutSessionAsync(Guid userId, PlanType planType, string originUrl)
        {
            var user = await _userRepository.GetByIdAsync(userId);
            if (user == null)
                throw new KeyNotFoundException("Usuário não encontrado.");

            // Garantir que o cliente Stripe existe
            if (string.IsNullOrEmpty(user.StripeCustomerId))
            {
                user.StripeCustomerId = await CreateStripeCustomerAsync(user);
                await _userRepository.UpdateAsync(user);
            }

            var isAnnual = planType == PlanType.Annual;
            var priceId = isAnnual ? _annualPriceId : _monthlyPriceId;
            var mode = isAnnual ? "payment" : "subscription";

            var sessionOptions = BuildSessionOptions(user.StripeCustomerId, priceId, mode, planType, userId, originUrl, isAnnual);

            try
            {
                var sessionService = new SessionService();
                var session = await sessionService.CreateAsync(sessionOptions);
                return session.Url;
            }
            catch (StripeException ex) when (
                ex.Message.Contains("No such customer", StringComparison.OrdinalIgnoreCase)
                || ex.StripeError?.Code == "resource_missing")
            {
                _logger.LogWarning(ex,
                    "Cliente {CustomerId} não encontrado na Stripe para o usuário {UserId}. Recriando cliente...",
                    user.StripeCustomerId, userId);

                user.StripeCustomerId = await CreateStripeCustomerAsync(user);
                await _userRepository.UpdateAsync(user);

                sessionOptions.Customer = user.StripeCustomerId;
                var sessionService = new SessionService();
                var session = await sessionService.CreateAsync(sessionOptions);
                return session.Url;
            }
        }

        // ── Portal ────────────────────────────────────────────────────────────────

        public async Task<string> CreateCustomerPortalSessionAsync(Guid userId, string originUrl)
        {
            var user = await _userRepository.GetByIdAsync(userId);
            if (user == null || string.IsNullOrEmpty(user.StripeCustomerId))
                throw new ApplicationException("Cliente Stripe não configurado para o usuário.");

            var options = new Stripe.BillingPortal.SessionCreateOptions
            {
                Customer = user.StripeCustomerId,
                ReturnUrl = $"{originUrl}/dashboard/perfil"
            };

            var service = new Stripe.BillingPortal.SessionService();
            var session = await service.CreateAsync(options);
            return session.Url;
        }

        // ── Webhook Stripe ────────────────────────────────────────────────────────

        public async Task ProcessWebhookAsync(string jsonPayload, string stripeSignatureHeader, string webhookSecret)
        {
            Stripe.Event stripeEvent;
            try
            {
                stripeEvent = EventUtility.ConstructEvent(jsonPayload, stripeSignatureHeader, webhookSecret);
            }
            catch (StripeException ex)
            {
                _logger.LogWarning(ex, "Assinatura Stripe inválida no webhook.");
                throw;
            }

            _logger.LogInformation(
                "Recebido evento da Stripe Webhook. EventType={EventType} EventId={EventId}",
                stripeEvent.Type, stripeEvent.Id);

            // Idempotência: verificar se já processamos este evento
            if (await _webhookEventRepository.IsAlreadyProcessedAsync("stripe", stripeEvent.Id))
            {
                _logger.LogInformation(
                    "Webhook Stripe ignorado (já processado). EventId={EventId} EventType={EventType}",
                    stripeEvent.Id, stripeEvent.Type);
                return;
            }

            try
            {
                switch (stripeEvent.Type)
                {
                    case "checkout.session.completed":
                        await HandleCheckoutSessionCompletedAsync(stripeEvent);
                        break;

                    case "invoice.payment_succeeded":
                        await HandleInvoicePaymentSucceededAsync(stripeEvent);
                        break;

                    case "customer.subscription.deleted":
                    case "customer.subscription.updated":
                        await HandleSubscriptionChangedAsync(stripeEvent);
                        break;

                    case "charge.refunded":
                        await HandleChargeRefundedAsync(stripeEvent);
                        break;

                    default:
                        _logger.LogInformation(
                            "Evento Stripe não tratado. EventType={EventType} EventId={EventId}",
                            stripeEvent.Type, stripeEvent.Id);
                        break;
                }

                // Registrar idempotência após processamento bem-sucedido
                await _webhookEventRepository.MarkAsProcessedAsync("stripe", stripeEvent.Id);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex,
                    "Erro ao processar Stripe Webhook. EventType={EventType} EventId={EventId}",
                    stripeEvent.Type, stripeEvent.Id);
                throw;
            }
        }

        // ── Cancelamento e Reembolso ──────────────────────────────────────────────

        public async Task CancelAndRefundAsync(Guid userId)
        {
            var user = await _userRepository.GetByIdAsync(userId);
            if (user == null)
                throw new KeyNotFoundException("Usuário não encontrado.");

            if (user.PlanType != "Premium")
                throw new ApplicationException("Você não possui uma assinatura paga ativa.");

            if (!user.SubscriptionStartedAt.HasValue
                || user.SubscriptionStartedAt.Value <= DateTime.UtcNow.AddDays(-_settings.RefundWindowDays))
                throw new ApplicationException(
                    $"O prazo de {_settings.RefundWindowDays} dias para solicitar reembolso já expirou.");

                        // Determinar gateway pelo campo dedicado (sem mais checar StartsWith("cus_"))
            var hasMercadoPago = !string.IsNullOrEmpty(user.MercadoPagoPaymentId);
            var hasStripe = !string.IsNullOrEmpty(user.StripeSubscriptionId) || !string.IsNullOrEmpty(user.StripeCustomerId);

            if (hasMercadoPago && hasStripe)
            {
                _logger.LogWarning(
                    "Inconsistência detectada: Usuário {UserId} possui registros de pagamento em ambos os gateways (Stripe e Mercado Pago). Executando fluxo MP por precedência.",
                    userId);
            }

            var isMercadoPago = hasMercadoPago;
            var isStripe = !isMercadoPago && hasStripe;

            if (isStripe)
            {
                await ProcessStripeRefundAsync(user, userId);
            }
            else if (isMercadoPago)
            {
                await ProcessMercadoPagoRefundAsync(user, userId);
            }
            else
            {
                throw new ApplicationException("Nenhum gateway de pagamento identificado para este usuário.");
            }

            // Rebaixar usuário para Free
            user.PlanType = "Free";
            user.PremiumUntil = DateTime.UtcNow;
            user.SubscriptionStatus = "canceled";
            user.StripeSubscriptionId = null;
            user.MercadoPagoPaymentId = null;
            user.SubscriptionStartedAt = null;
            await _userRepository.UpdateAsync(user);

            _logger.LogInformation(
                "Usuário {UserId} reembolsado e rebaixado para Free.", userId);
        }

        public async Task CancelSubscriptionAsync(string subscriptionId)
        {
            if (string.IsNullOrEmpty(subscriptionId)) return;
            try
            {
                var stripeSubService = new Stripe.SubscriptionService();
                await stripeSubService.CancelAsync(subscriptionId);
                _logger.LogInformation("Assinatura Stripe {SubscriptionId} cancelada com sucesso via CancelSubscriptionAsync.", subscriptionId);
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Erro ao cancelar assinatura no Stripe {SubscriptionId} ao excluir a conta.", subscriptionId);
            }
        }

        // ══ Métodos privados ══════════════════════════════════════════════════════

        private async Task HandleCheckoutSessionCompletedAsync(Stripe.Event stripeEvent)
        {
            var session = stripeEvent.Data.Object as Session;
            if (session == null || !session.Metadata.TryGetValue("userId", out var userIdStr))
                return;

            if (!Guid.TryParse(userIdStr, out var userId))
                return;

            var user = await _userRepository.GetByIdAsync(userId);
            if (user == null) return;

            user.PlanType = "Premium";
            user.SubscriptionStatus = "active";
            user.StripeCustomerId = session.CustomerId;
            user.SubscriptionStartedAt = DateTime.UtcNow;

            if (session.Mode == "subscription")
            {
                if (!string.IsNullOrEmpty(user.StripeSubscriptionId)
                    && user.StripeSubscriptionId != session.SubscriptionId)
                {
                    await TryCancelStripeSubscriptionAsync(user.StripeSubscriptionId, userId);
                }

                user.StripeSubscriptionId = session.SubscriptionId;

                var isAnnual = session.Metadata.TryGetValue("planType", out var pt)
                    && pt.Equals("annual", StringComparison.OrdinalIgnoreCase);

                user.PremiumUntil = isAnnual
                    ? DateTime.UtcNow.AddYears(1).AddDays(_settings.GraceDays)
                    : DateTime.UtcNow.AddMonths(1).AddDays(_settings.GraceDays);
            }
            else if (session.Mode == "payment")
            {
                if (!string.IsNullOrEmpty(user.StripeSubscriptionId))
                {
                    await TryCancelStripeSubscriptionAsync(user.StripeSubscriptionId, userId);
                    user.StripeSubscriptionId = null;
                }

                user.PremiumUntil = DateTime.UtcNow.AddYears(1).AddDays(_settings.GraceDays);
            }

            await _userRepository.UpdateAsync(user);
            _logger.LogInformation(
                "Usuário {UserId} atualizado para Premium via checkout.session.completed. EventId={EventId}",
                userId, stripeEvent.Id);
        }

        private async Task HandleInvoicePaymentSucceededAsync(Stripe.Event stripeEvent)
        {
            var invoice = stripeEvent.Data.Object as Invoice;
            var subscriptionId = invoice?.Parent?.SubscriptionDetails?.SubscriptionId;

            if (invoice == null || string.IsNullOrEmpty(subscriptionId))
                return;

            var stripeCustomerService = new CustomerService();
            var customer = await stripeCustomerService.GetAsync(invoice.CustomerId);

            if (customer == null
                || !customer.Metadata.TryGetValue("userId", out var userIdStr)
                || !Guid.TryParse(userIdStr, out var userId))
                return;

            var user = await _userRepository.GetByIdAsync(userId);
            if (user == null) return;

            user.PlanType = "Premium";
            user.SubscriptionStatus = "active";
            user.StripeCustomerId = invoice.CustomerId;
            user.StripeSubscriptionId = subscriptionId;

            var stripeSubService = new Stripe.SubscriptionService();
            var subscription = await stripeSubService.GetAsync(subscriptionId);
            user.PremiumUntil = subscription?.Items?.Data?.Count > 0
                ? subscription.Items.Data[0].CurrentPeriodEnd.AddDays(_settings.GraceDays)
                : DateTime.UtcNow.AddMonths(1).AddDays(_settings.GraceDays);

            if (!user.SubscriptionStartedAt.HasValue)
                user.SubscriptionStartedAt = DateTime.UtcNow;

            await _userRepository.UpdateAsync(user);
            _logger.LogInformation(
                "Assinatura renovada para Usuário {UserId} via invoice.payment_succeeded. EventId={EventId}",
                userId, stripeEvent.Id);
        }

        private async Task HandleSubscriptionChangedAsync(Stripe.Event stripeEvent)
        {
            var subscription = stripeEvent.Data.Object as Stripe.Subscription;
            if (subscription == null) return;

            var stripeCustomerService = new CustomerService();
            var customer = await stripeCustomerService.GetAsync(subscription.CustomerId);

            if (customer == null
                || !customer.Metadata.TryGetValue("userId", out var userIdStr)
                || !Guid.TryParse(userIdStr, out var userId))
                return;

            var user = await _userRepository.GetByIdAsync(userId);
            if (user == null) return;

            user.SubscriptionStatus = subscription.Status;

            if (subscription.Status == "canceled" || subscription.Status == "unpaid")
            {
                user.PlanType = "Free";
                user.PremiumUntil = DateTime.UtcNow;
            }
            else if (subscription.Status == "active")
            {
                user.PlanType = "Premium";
                user.PremiumUntil = subscription.Items?.Data?.Count > 0
                    ? subscription.Items.Data[0].CurrentPeriodEnd.AddDays(_settings.GraceDays)
                    : DateTime.UtcNow.AddMonths(1).AddDays(_settings.GraceDays);
            }

            await _userRepository.UpdateAsync(user);
            _logger.LogInformation(
                "Assinatura do Usuário {UserId} atualizada. Status={Status} EventId={EventId}",
                userId, subscription.Status, stripeEvent.Id);
        }

        private async Task HandleChargeRefundedAsync(Stripe.Event stripeEvent)
        {
            var charge = stripeEvent.Data.Object as Stripe.Charge;
            if (charge == null || string.IsNullOrEmpty(charge.CustomerId)) return;

            var stripeCustomerService = new CustomerService();
            var customer = await stripeCustomerService.GetAsync(charge.CustomerId);

            if (customer == null
                || !customer.Metadata.TryGetValue("userId", out var userIdStr)
                || !Guid.TryParse(userIdStr, out var userId))
                return;

            var user = await _userRepository.GetByIdAsync(userId);
            if (user == null) return;

            user.PlanType = "Free";
            user.PremiumUntil = DateTime.UtcNow;
            user.SubscriptionStatus = "canceled";
            user.StripeSubscriptionId = null;
            user.SubscriptionStartedAt = null;

            await _userRepository.UpdateAsync(user);
            _logger.LogInformation(
                "Usuário {UserId} rebaixado para Free via Webhook Stripe (charge.refunded). EventId={EventId}",
                userId, stripeEvent.Id);
        }

        private async Task ProcessStripeRefundAsync(Domain.Entities.User user, Guid userId)
        {
            if (!string.IsNullOrEmpty(user.StripeSubscriptionId))
            {
                try
                {
                    // Plano mensal recorrente: buscar última invoice para obter o PaymentIntent
                    var invoiceService = new InvoiceService();
                    var invoices = await invoiceService.ListAsync(new InvoiceListOptions
                    {
                        Subscription = user.StripeSubscriptionId,
                        Limit = 1
                    });

                    var lastInvoice = invoices?.Data?.Count > 0 ? invoices.Data[0] : null;
                    if (lastInvoice != null && lastInvoice.Payments?.Data != null)
                    {
                        var refundService = new RefundService();
                        foreach (var payment in lastInvoice.Payments.Data)
                        {
                            var paymentIntentId = payment.Payment?.PaymentIntentId;
                            if (!string.IsNullOrEmpty(paymentIntentId) && payment.Status == "succeeded")
                            {
                                await refundService.CreateAsync(new RefundCreateOptions
                                {
                                    PaymentIntent = paymentIntentId
                                });
                                _logger.LogInformation(
                                    "Reembolso Stripe criado. PaymentIntentId={PaymentIntentId} UserId={UserId}",
                                    paymentIntentId, userId);
                            }
                        }
                    }
                }
                catch (StripeException ex) when (
                    ex.HttpStatusCode == System.Net.HttpStatusCode.NotFound
                    || ex.StripeError?.Code == "resource_missing"
                    || ex.Message.Contains("No such subscription", StringComparison.OrdinalIgnoreCase))
                {
                    _logger.LogWarning(ex,
                        "Assinatura Stripe {SubId} não encontrada para buscar faturas/reembolso. Ignorando reembolso da assinatura.",
                        user.StripeSubscriptionId);
                }

                try
                {
                    var stripeSubService = new Stripe.SubscriptionService();
                    await stripeSubService.CancelAsync(user.StripeSubscriptionId);
                    _logger.LogInformation(
                        "Assinatura Stripe cancelada. SubscriptionId={SubId} UserId={UserId}",
                        user.StripeSubscriptionId, userId);
                }
                catch (StripeException ex) when (
                    ex.HttpStatusCode == System.Net.HttpStatusCode.NotFound
                    || ex.StripeError?.Code == "resource_missing"
                    || ex.Message.Contains("No such subscription", StringComparison.OrdinalIgnoreCase))
                {
                    _logger.LogWarning(ex,
                        "Assinatura Stripe {SubId} não encontrada para cancelamento no gateway (já removida). Prosseguindo.",
                        user.StripeSubscriptionId);
                }
            }
            else if (!string.IsNullOrEmpty(user.StripeCustomerId))
            {
                try
                {
                    // Plano anual (pagamento único): buscar última cobrança do cliente
                    var piService = new PaymentIntentService();
                    var paymentIntents = await piService.ListAsync(new PaymentIntentListOptions
                    {
                        Customer = user.StripeCustomerId,
                        Limit = 1
                    });

                    var lastPi = paymentIntents?.Data?.Find(pi => pi.Status == "succeeded");
                    if (lastPi != null)
                    {
                        var refundService = new RefundService();
                        await refundService.CreateAsync(new RefundCreateOptions
                        {
                            PaymentIntent = lastPi.Id
                        });
                        _logger.LogInformation(
                            "Reembolso Stripe (plano anual) criado. PaymentIntentId={PaymentIntentId} UserId={UserId}",
                            lastPi.Id, userId);
                    }
                }
                catch (StripeException ex) when (
                    ex.HttpStatusCode == System.Net.HttpStatusCode.NotFound
                    || ex.StripeError?.Code == "resource_missing"
                    || ex.Message.Contains("No such customer", StringComparison.OrdinalIgnoreCase))
                {
                    _logger.LogWarning(ex,
                        "Cliente Stripe {CustomerId} não encontrado para processar reembolso anual. Ignorando.",
                        user.StripeCustomerId);
                }
            }
        }

        private async Task ProcessMercadoPagoRefundAsync(Domain.Entities.User user, Guid userId)
        {
            if (!long.TryParse(user.MercadoPagoPaymentId, out var mpPaymentId))
                throw new ApplicationException("ID de pagamento do Mercado Pago inválido para reembolso.");

            try
            {
                var mpPaymentClient = new MercadoPago.Client.Payment.PaymentClient();
                await mpPaymentClient.RefundAsync(mpPaymentId);
                _logger.LogInformation(
                    "Reembolso criado no Mercado Pago. PaymentId={PaymentId} UserId={UserId}",
                    mpPaymentId, userId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex,
                    "Erro ao processar reembolso no Mercado Pago. PaymentId={PaymentId} UserId={UserId}",
                    mpPaymentId, userId);
                throw new ApplicationException(
                    "Não foi possível processar o estorno no Mercado Pago. Por favor, entre em contato com o suporte.");
            }
        }

        private async Task TryCancelStripeSubscriptionAsync(string subscriptionId, Guid userId)
        {
            try
            {
                var stripeSubService = new Stripe.SubscriptionService();
                await stripeSubService.CancelAsync(subscriptionId);
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex,
                    "Erro ao cancelar assinatura anterior no Stripe. SubscriptionId={SubId} UserId={UserId}",
                    subscriptionId, userId);
            }
        }

        private async Task<string> CreateStripeCustomerAsync(Domain.Entities.User user)
        {
            var customerOptions = new CustomerCreateOptions
            {
                Email = user.Email,
                Name = $"{user.FirstName} {user.LastName}",
                Metadata = new Dictionary<string, string>
                {
                    { "userId", user.Id.ToString() }
                }
            };
            var customerService = new CustomerService();
            var customer = await customerService.CreateAsync(customerOptions);
            return customer.Id;
        }

        private static SessionCreateOptions BuildSessionOptions(
            string customerId,
            string priceId,
            string mode,
            PlanType planType,
            Guid userId,
            string originUrl,
            bool isAnnual)
        {
            var options = new SessionCreateOptions
            {
                Customer = customerId,
                LineItems = new List<SessionLineItemOptions>
                {
                    new SessionLineItemOptions { Price = priceId, Quantity = 1 }
                },
                Mode = mode,
                SuccessUrl = $"{originUrl}/payment/success?session_id={{CHECKOUT_SESSION_ID}}",
                CancelUrl = $"{originUrl}/payment/failure",
                Metadata = new Dictionary<string, string>
                {
                    { "userId", userId.ToString() },
                    { "planType", planType.ToString().ToLowerInvariant() }
                }
            };

            if (isAnnual)
            {
                options.PaymentMethodOptions = new SessionPaymentMethodOptionsOptions
                {
                    Card = new SessionPaymentMethodOptionsCardOptions
                    {
                        Installments = new SessionPaymentMethodOptionsCardInstallmentsOptions
                        {
                            Enabled = true
                        }
                    }
                };
            }

            return options;
        }
    }
}