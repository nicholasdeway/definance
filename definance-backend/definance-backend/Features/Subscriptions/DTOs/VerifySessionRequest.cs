namespace definance_backend.Features.Subscriptions.DTOs
{
    public class VerifySessionRequest
    {
        public string? SessionId { get; set; }
        public string? PaymentId { get; set; }
    }
}