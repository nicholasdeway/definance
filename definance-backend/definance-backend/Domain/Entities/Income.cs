namespace definance_backend.Domain.Entities
{
    public class Income
    {
        public Guid Id { get; set; }
        public Guid UserId { get; set; }
        public string Name { get; set; } = null!;
        public decimal Amount { get; set; }
        public string Type { get; set; } = null!;
        public DateTime Date { get; set; }
        public bool IsRecurring { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }
}
