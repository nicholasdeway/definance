namespace definance_backend.Features.Expenses.DTOs
{
    public class CreateUpdateExpenseDto
    {
        public string Name { get; set; } = null!;
        public decimal Amount { get; set; }
        public string Category { get; set; } = null!;
        public DateTime Date { get; set; }
        public string ExpenseType { get; set; } = "Variável";
        public string Status { get; set; } = "Pendente";
        public string? Description { get; set; }
        public string? Notes { get; set; }
        public Guid? BillId { get; set; }
        public DateTime? DueDate { get; set; }
    }
}