using System;

namespace definance_backend.Features.Profiles.DTOs
{
    public class HistoryExportItemDto
    {
        public DateTime Date { get; set; }
        public string Name { get; set; } = null!;
        public decimal Amount { get; set; }
        public string Type { get; set; } = null!; // "Receita" ou "Despesa"
        public string Category { get; set; } = null!;
    }
}
