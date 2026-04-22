namespace definance_backend.Features.Goals.DTOs
{
    public class GoalDto
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = null!;
        public decimal TargetAmount { get; set; }
        public decimal CurrentAmount { get; set; }
        public string Category { get; set; } = null!;
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public decimal MonthlyReserve { get; set; }
        public int ReserveDay { get; set; }
        public bool IsCompleted { get; set; }
        public Guid? LinkedBillId { get; set; }
    }
}