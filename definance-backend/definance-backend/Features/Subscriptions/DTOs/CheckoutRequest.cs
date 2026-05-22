using definance_backend.Common.Enums;

namespace definance_backend.Features.Subscriptions.DTOs
{
    public class CheckoutRequest
    {
        public PlanType? PlanType { get; set; }

        public string? OriginUrl { get; set; }
        public string? Gateway { get; set; }
    }
}