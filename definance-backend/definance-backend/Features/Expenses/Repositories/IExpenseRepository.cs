using definance_backend.Domain.Entities;

namespace definance_backend.Features.Expenses.Repositories
{
    public interface IExpenseRepository
    {
        Task<Expense?> GetByIdAsync(Guid id);
        Task<IEnumerable<Expense>> GetByUserIdAsync(Guid userId, int? month = null, int? year = null);
        Task CreateAsync(Expense expense);
        Task UpdateAsync(Expense expense);
        Task MarkAsPaidAsync(Guid id, Guid userId);
        Task DeleteAsync(Guid id);
    }
}
