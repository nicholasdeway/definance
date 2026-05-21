using System;

namespace definance_backend.Features.Goals.DTOs
{
    public class GoalHistoryDto
    {
        public decimal Amount { get; set; }
        public DateTime Date { get; set; }
        public string Name { get; set; } = null!;
    }
}
