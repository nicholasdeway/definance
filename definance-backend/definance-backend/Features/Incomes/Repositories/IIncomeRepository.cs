using definance_backend.Domain.Entities;

namespace definance_backend.Features.Incomes.Repositories
{
    public interface IIncomeRepository
    {
        Task<Income?> GetByIdAsync(Guid id);
        Task<IEnumerable<Income>> GetByUserIdAsync(Guid userId, int? month = null, int? year = null, DateTime? startDate = null, DateTime? endDate = null);
        Task CreateAsync(Income income);
        Task CreateBatchAsync(IEnumerable<Income> incomes);
        Task UpdateAsync(Income income);
        Task DeleteAsync(Guid id);
        Task DeleteBatchAsync(IEnumerable<Guid> ids);
    }
}