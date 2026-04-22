using definance_backend.Features.Goals.DTOs;

namespace definance_backend.Features.Goals.Services
{
    public interface IGoalService
    {
        Task<GoalDto> GetGoalByIdAsync(Guid userId, Guid goalId);
        Task<IEnumerable<GoalDto>> GetUserGoalsAsync(Guid userId);
        Task<GoalDto> CreateGoalAsync(Guid userId, CreateUpdateGoalDto dto);
        Task<GoalDto> UpdateGoalAsync(Guid userId, Guid goalId, CreateUpdateGoalDto dto);
        Task<GoalDto> DepositAsync(Guid userId, Guid goalId, DepositGoalDto dto);
        Task DeleteGoalAsync(Guid userId, Guid goalId);
    }
}