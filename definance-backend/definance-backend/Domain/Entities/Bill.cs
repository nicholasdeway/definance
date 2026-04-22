namespace definance_backend.Domain.Entities
{
    public class Bill
    {
        public Guid Id { get; set; }
        public Guid UserId { get; set; }
        public string Name { get; set; } = null!;
        public decimal Amount { get; set; }
        public string Category { get; set; } = null!;
        public string BillType { get; set; } = null!;
        public int? DueDay { get; set; }
        public DateTime? DueDate { get; set; }
        public string Status { get; set; } = null!;
        public bool IsRecurring { get; set; }
        public string? Description { get; set; }
        public string? Notes { get; set; }
        public Guid? GoalId { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }
}