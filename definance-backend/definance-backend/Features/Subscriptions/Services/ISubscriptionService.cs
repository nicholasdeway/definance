using System;
using System.Threading.Tasks;
using definance_backend.Common.Enums;

namespace definance_backend.Features.Subscriptions.Services
{
    public interface ISubscriptionService
    {
        Task<string> CreateCheckoutSessionAsync(Guid userId, PlanType planType, string originUrl);
        Task<string> CreateCustomerPortalSessionAsync(Guid userId, string originUrl);
        Task ProcessWebhookAsync(string jsonPayload, string stripeSignatureHeader, string webhookSecret);
        Task CancelAndRefundAsync(Guid userId);
    }
}