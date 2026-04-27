namespace definance_backend.Domain.Entities
{
    public class Category
    {
        public Guid Id { get; set; }
        public Guid? UserId { get; set; } // Null for system categories
        public string Name { get; set; } = null!;
        public string Type { get; set; } = null!; // "Entrada", "Saída", "Ambos"
        public string? Color { get; set; }
        public string? Icon { get; set; }
        public string? Keywords { get; set; }
        public bool IsSystem { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }
}
