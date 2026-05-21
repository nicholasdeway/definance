using definance_backend.Domain.Entities;
using definance_backend.Features.Goals.DTOs;

namespace definance_backend.Features.Goals.Repositories
{
    public interface IGoalRepository
    {
        Task<Goal?> GetByIdAsync(Guid id);
        Task<IEnumerable<Goal>> GetByUserIdAsync(Guid userId);
        Task CreateAsync(Goal goal);
        Task UpdateAsync(Goal goal);
        Task DeleteAsync(Guid id, Guid userId);
        Task DeleteWithCascadeAsync(Guid id, Guid userId, bool deleteTransactions);
        Task<IEnumerable<GoalHistoryDto>> GetGoalHistoryAsync(Guid userId, Guid goalId);
    }
}