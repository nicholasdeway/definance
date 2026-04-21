namespace definance_backend.Domain.Entities
{
    public class Expense
    {
        public Guid Id { get; set; }
        public Guid UserId { get; set; }
        public string Name { get; set; } = null!;
        public decimal Amount { get; set; }
        public string Category { get; set; } = null!;
        public DateTime Date { get; set; }
        public string ExpenseType { get; set; } = null!;
        public string Status { get; set; } = null!;
        public string? Description { get; set; }
        public string? Notes { get; set; }
        public Guid? BillId { get; set; }
        public DateTime? DueDate { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }
}