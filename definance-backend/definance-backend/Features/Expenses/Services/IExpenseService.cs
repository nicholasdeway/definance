using definance_backend.Features.Expenses.DTOs;

namespace definance_backend.Features.Expenses.Services
{
    public interface IExpenseService
    {
        Task<ExpenseDto> GetExpenseByIdAsync(Guid userId, Guid expenseId);
        Task<IEnumerable<ExpenseDto>> GetUserExpensesAsync(Guid userId, int? month = null, int? year = null);
        Task<ExpenseDto> CreateExpenseAsync(Guid userId, CreateUpdateExpenseDto dto);
        Task<ExpenseDto> UpdateExpenseAsync(Guid userId, Guid expenseId, CreateUpdateExpenseDto dto);
        Task<ExpenseDto> MarkAsPaidAsync(Guid userId, Guid expenseId);
        Task DeleteExpenseAsync(Guid userId, Guid expenseId);
    }
}
