using definance_backend.Features.DailyExpenses.DTOs;

namespace definance_backend.Features.DailyExpenses.Services
{
    public interface IDailyExpenseService
    {
        Task<QuickExpenseResponseDto> CreateQuickExpenseAsync(Guid userId, QuickExpenseRequestDto dto);
    }
}