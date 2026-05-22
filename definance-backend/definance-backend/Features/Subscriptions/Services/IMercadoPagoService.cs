using System;
using System.Threading.Tasks;
using definance_backend.Common.Enums;

namespace definance_backend.Features.Subscriptions.Services
{
    public interface IMercadoPagoService
    {
        Task<string> CreateCheckoutPreferenceAsync(Guid userId, PlanType planType, string originUrl);
        Task<bool> VerifyPaymentAsync(long paymentId, Guid userId);
        Task ProcessWebhookAsync(
            string topic,
            string resourceId,
            string? dataId,
            string? xRequestId,
            string? timestamp,
            string? receivedSignature);
    }
}
