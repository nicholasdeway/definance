namespace definance_backend.Features.WhatsApp.DTOs
{
    public class ZApiWebhookDto
    {
        public string? InstanceId { get; set; }
        public string? MessageId { get; set; }
        public string? ZaapId { get; set; }
        public string? Id { get; set; }
        public string? Phone { get; set; }
        public string? SenderName { get; set; }
        public string? Type { get; set; }
        public string? Message { get; set; }
        public ZApiTextDto? Text { get; set; }
        public ZApiAudioDto? Audio { get; set; }
        public ZApiWebhookDto? Data { get; set; }
    }

    public class ZApiTextDto
    {
        public string? Message { get; set; }
    }

    public class ZApiAudioDto
    {
        public string? AudioUrl { get; set; }
        public string? MediaUrl { get; set; }
        public string? Url { get; set; }
    }
}