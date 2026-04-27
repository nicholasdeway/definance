namespace definance_backend.Features.DailyExpenses.Models
{
    public class ParsedExpenseResult
    {
        public string Description { get; set; } = string.Empty;
        public decimal Amount { get; set; }
        public string Category { get; set; } = string.Empty;
        public string TransactionType { get; set; } = "Saída";
        public DateTime Date { get; set; }
    }
}