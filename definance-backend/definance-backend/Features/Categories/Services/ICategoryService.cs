using definance_backend.Features.Categories.DTOs;

namespace definance_backend.Features.Categories.Services
{
    public interface ICategoryService
    {
        Task<IEnumerable<CategoryDto>> GetUserCategoriesAsync(Guid userId);
        Task<CategoryDto> CreateCategoryAsync(Guid userId, CreateCategoryDto dto);
        Task<CategoryDto> UpdateCategoryAsync(Guid userId, Guid categoryId, UpdateCategoryDto dto);
        Task DeleteCategoryAsync(Guid userId, Guid categoryId);
    }
}
