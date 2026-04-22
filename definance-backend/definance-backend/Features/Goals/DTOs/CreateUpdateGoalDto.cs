namespace definance_backend.Features.Goals.DTOs
{
    public class CreateUpdateGoalDto
    {
        public string Name { get; set; } = null!;
        public decimal TargetAmount { get; set; }
        public string Category { get; set; } = "Outros";
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public decimal MonthlyReserve { get; set; }
        public int ReserveDay { get; set; } = 5;
    }
}