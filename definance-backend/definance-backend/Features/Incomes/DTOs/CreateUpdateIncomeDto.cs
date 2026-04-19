namespace definance_backend.Features.Incomes.DTOs
{
    public class CreateUpdateIncomeDto
    {
        public string Name { get; set; } = null!;
        public decimal Amount { get; set; }
        public string Type { get; set; } = null!;
        public DateTime Date { get; set; }
        public bool IsRecurring { get; set; }
    }
}