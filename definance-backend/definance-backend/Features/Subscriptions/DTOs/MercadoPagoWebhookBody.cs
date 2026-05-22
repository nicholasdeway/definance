namespace definance_backend.Features.Subscriptions.DTOs
{
    public class MercadoPagoWebhookBody
    {
        public string? Action { get; set; }
        public string? Type { get; set; }
        public MercadoPagoWebhookData? Data { get; set; }
    }
}