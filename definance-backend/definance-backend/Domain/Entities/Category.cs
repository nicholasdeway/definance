namespace definance_backend.Domain.Entities
{
    public class Category
    {
        public Guid Id { get; set; }
        public Guid? UserId { get; set; }
        public string Name { get; set; } = null!;
        public string Type { get; set; } = null!;
        public string? Color { get; set; }
        public string? Icon { get; set; }
        public string? Keywords { get; set; }
        public bool IsSystem { get; set; }
        public decimal? MonthlyLimit { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }
}