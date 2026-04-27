using System.Text.Json.Serialization;

namespace definance_backend.Features.DailyExpenses.DTOs
{
    public class QuickExpenseRequestDto
    {
        public string Input { get; set; } = string.Empty;
    }

    public class QuickExpenseResponseDto
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public decimal Amount { get; set; }
        public string Category { get; set; } = string.Empty;
        [JsonPropertyName("transactionType")]
        public string TransactionType { get; set; } = "Saída";
        public DateTime Date { get; set; }
        public string Status { get; set; } = string.Empty;
    }
}