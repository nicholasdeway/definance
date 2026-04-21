namespace definance_backend.Features.Bills.DTOs
{
    public class BillDto
    {
        public Guid Id { get; set; }
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
    }
}