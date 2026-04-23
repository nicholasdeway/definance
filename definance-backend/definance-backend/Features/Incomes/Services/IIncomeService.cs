using definance_backend.Features.Incomes.DTOs;

namespace definance_backend.Features.Incomes.Services
{
    public interface IIncomeService
    {
        Task<IncomeDto> GetIncomeByIdAsync(Guid userId, Guid incomeId);
        Task<IEnumerable<IncomeDto>> GetUserIncomesAsync(Guid userId, int? month = null, int? year = null);
        Task<IncomeDto> CreateIncomeAsync(Guid userId, CreateUpdateIncomeDto dto);
        Task<IncomeDto> UpdateIncomeAsync(Guid userId, Guid incomeId, CreateUpdateIncomeDto dto);
        Task DeleteIncomeAsync(Guid userId, Guid incomeId);
    }
}