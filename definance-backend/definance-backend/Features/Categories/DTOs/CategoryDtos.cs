namespace definance_backend.Features.Categories.DTOs
{
    public class CategoryDto
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = null!;
        public string Type { get; set; } = null!;
        public string? Color { get; set; }
        public string? Icon { get; set; }
        public string? Keywords { get; set; }
        public bool IsSystem { get; set; }
        public decimal? MonthlyLimit { get; set; }
    }

    public class CreateCategoryDto
    {
        public string Name { get; set; } = null!;
        public string Type { get; set; } = null!; // "Entrada", "Saída", "Ambos"
        public string? Color { get; set; }
        public string? Icon { get; set; }
        public string? Keywords { get; set; }
        public decimal? MonthlyLimit { get; set; }
    }

    public class UpdateCategoryDto
    {
        public string Name { get; set; } = null!;
        public string Type { get; set; } = null!;
        public string? Color { get; set; }
        public string? Icon { get; set; }
        public string? Keywords { get; set; }
        public decimal? MonthlyLimit { get; set; }
    }

    public class UpdateCategoryLimitDto
    {
        public decimal? MonthlyLimit { get; set; }
    }
}