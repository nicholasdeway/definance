namespace definance_backend.Features.DailyExpenses.DTOs
{
    public class AiParsedResponseDto
    {
        public string Name { get; set; } = string.Empty;
        public double Amount { get; set; }
        public string Category { get; set; } = string.Empty;
        public string? Type { get; set; }
        public string? Date { get; set; }
    }
}