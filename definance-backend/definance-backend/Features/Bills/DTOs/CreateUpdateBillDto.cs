namespace definance_backend.Features.Bills.DTOs
{
    public class CreateUpdateBillDto
    {
        public string Name { get; set; } = null!;
        public decimal Amount { get; set; }
        public string Category { get; set; } = "Outros";
        public string BillType { get; set; } = "Fixa";
        public int? DueDay { get; set; }
        public DateTime? DueDate { get; set; }
        public string Status { get; set; } = "Pendente";
        public bool IsRecurring { get; set; } = true;
        public bool IsParcelado { get; set; } = false;
        public int? ParcelasTotal { get; set; }
        public int? ParcelasPagas { get; set; }
        public string? Description { get; set; }
        public string? Notes { get; set; }
    }
}