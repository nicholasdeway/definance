using definance_backend.Domain.Entities;

namespace definance_backend.Features.DailyExpenses.Repositories
{
    public interface IDailyExpenseRepository
    {
        Task<IEnumerable<Expense>> GetDailySummaryAsync(Guid userId, DateTime date);
    }
}