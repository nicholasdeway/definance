using definance_backend.Domain.Entities;
using definance_backend.Features.Expenses.DTOs;
using definance_backend.Features.Expenses.Repositories;

namespace definance_backend.Features.Expenses.Services
{
    public class ExpenseService : IExpenseService
    {
        private readonly IExpenseRepository _expenseRepository;

        public ExpenseService(IExpenseRepository expenseRepository)
        {
            _expenseRepository = expenseRepository;
        }

        public async Task<ExpenseDto> GetExpenseByIdAsync(Guid userId, Guid expenseId)
        {
            var expense = await _expenseRepository.GetByIdAsync(expenseId);

            if (expense == null)
                throw new KeyNotFoundException("Despesa não encontrada.");

            if (expense.UserId != userId)
                throw new UnauthorizedAccessException("Esta despesa não pertence a este usuário.");

            return MapToDto(expense);
        }

        public async Task<IEnumerable<ExpenseDto>> GetUserExpensesAsync(Guid userId, int? month = null, int? year = null, DateTime? startDate = null, DateTime? endDate = null)
        {
            var expenses = await _expenseRepository.GetByUserIdAsync(userId, month, year, startDate, endDate);
            return expenses.Select(MapToDto);
        }

        public async Task<ExpenseDto> CreateExpenseAsync(Guid userId, CreateUpdateExpenseDto dto)
        {
            var expense = new Expense
            {
                Id          = Guid.NewGuid(),
                UserId      = userId,
                Name        = dto.Name,
                Amount      = dto.Amount,
                Category    = dto.Category,
                Date        = dto.Date,
                ExpenseType = dto.ExpenseType,
                Status      = dto.Status,
                Description = dto.Description,
                Notes       = dto.Notes
            };

            await _expenseRepository.CreateAsync(expense);
            return MapToDto(expense);
        }

        public async Task<ExpenseDto> UpdateExpenseAsync(Guid userId, Guid expenseId, CreateUpdateExpenseDto dto)
        {
            var expense = await _expenseRepository.GetByIdAsync(expenseId);

            if (expense == null)
                throw new KeyNotFoundException("Despesa não encontrada.");

            if (expense.UserId != userId)
                throw new UnauthorizedAccessException("Esta despesa não pertence a este usuário.");

            expense.Name        = dto.Name;
            expense.Amount      = dto.Amount;
            expense.Category    = dto.Category;
            expense.Date        = dto.Date;
            expense.ExpenseType = dto.ExpenseType;
            expense.Status      = dto.Status;
            expense.Description = dto.Description;
            expense.Notes       = dto.Notes;

            await _expenseRepository.UpdateAsync(expense);
            return MapToDto(expense);
        }

        public async Task<ExpenseDto> MarkAsPaidAsync(Guid userId, Guid expenseId)
        {
            var expense = await _expenseRepository.GetByIdAsync(expenseId);

            if (expense == null)
                throw new KeyNotFoundException("Despesa não encontrada.");

            if (expense.UserId != userId)
                throw new UnauthorizedAccessException("Esta despesa não pertence a este usuário.");

            if (expense.Status == "Pago")
                throw new InvalidOperationException("Esta despesa já está marcada como paga.");

            expense.Status = "Pago";
            await _expenseRepository.UpdateAsync(expense);

            return MapToDto(expense);
        }

        public async Task DeleteExpenseAsync(Guid userId, Guid expenseId)
        {
            var expense = await _expenseRepository.GetByIdAsync(expenseId);

            if (expense == null)
                throw new KeyNotFoundException("Despesa não encontrada.");

            if (expense.UserId != userId)
                throw new UnauthorizedAccessException("Esta despesa não pertence a este usuário.");

            await _expenseRepository.DeleteAsync(expenseId);
        }

        private static ExpenseDto MapToDto(Expense expense) => new()
        {
            Id          = expense.Id,
            Name        = expense.Name,
            Amount      = expense.Amount,
            Category    = expense.Category,
            Date        = expense.Date,
            ExpenseType = expense.ExpenseType,
            Status      = expense.Status,
            TransactionType = expense.TransactionType,
            Description = expense.Description,
            Notes       = expense.Notes
        };
    }
}