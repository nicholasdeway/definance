namespace definance_backend.Domain.Entities
{
    public class Goal
    {
        public Guid Id { get; set; }
        public Guid UserId { get; set; }
        public string Name { get; set; } = null!;
        public decimal TargetAmount { get; set; }
        public decimal CurrentAmount { get; set; }
        public string Category { get; set; } = "Outros";
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public decimal MonthlyReserve { get; set; }
        public int ReserveDay { get; set; }
        public bool IsCompleted { get; set; }
        public Guid? LinkedBillId { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }
}
