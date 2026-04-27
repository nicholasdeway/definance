using definance_backend.Domain.Entities;

namespace definance_backend.Features.Categories.Repositories
{
    public interface ICategoryRepository
    {
        Task<Category?> GetByIdAsync(Guid id);
        Task<IEnumerable<Category>> GetByUserIdAsync(Guid userId);
        Task<IEnumerable<Category>> GetSystemCategoriesAsync();
        Task CreateAsync(Category category);
        Task UpdateAsync(Category category);
        Task DeleteAsync(Guid id);
        Task<bool> IsInUseAsync(Guid categoryId);
        Task<bool> ExistsByNameAsync(Guid userId, string name, string type);
    }
}
