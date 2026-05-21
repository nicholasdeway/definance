namespace definance_backend.Features.WhatsApp.DTOs
{
    public class WhatsAppPairingResponseDto
    {
        public string Code { get; set; } = null!;
        public string Status { get; set; } = null!;
        public DateTime ExpiresAt { get; set; }
    }
}