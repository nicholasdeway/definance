using definance_backend.Domain.Entities;
using definance_backend.Features.Expenses.DTOs;
using definance_backend.Features.Expenses.Repositories;
using definance_backend.Features.Shared.Services;

namespace definance_backend.Features.Expenses.Services
{
    public class ExpenseService : IExpenseService
    {
        private readonly IExpenseRepository _expenseRepository;
        private readonly IDateTimeProvider _dateTimeProvider;

        public ExpenseService(IExpenseRepository expenseRepository, IDateTimeProvider dateTimeProvider)
        {
            _expenseRepository = expenseRepository ?? throw new ArgumentNullException(nameof(expenseRepository));
            _dateTimeProvider = dateTimeProvider ?? throw new ArgumentNullException(nameof(dateTimeProvider));
        }

        public async Task<ExpenseDto> GetExpenseByIdAsync(Guid userId, Guid expenseId)
        {
            ValidateUserId(userId);
            var expense = await GetAndValidateUserExpenseAsync(userId, expenseId);
            return MapToDto(expense);
        }

        public async Task<IEnumerable<ExpenseDto>> GetUserExpensesAsync(Guid userId, int? month = null, int? year = null, DateTime? startDate = null, DateTime? endDate = null)
        {
            ValidateUserId(userId);
            var expenses = await _expenseRepository.GetByUserIdAsync(userId, month, year, startDate, endDate);
            return expenses.Select(MapToDto);
        }

        public async Task<ExpenseDto> CreateExpenseAsync(Guid userId, CreateUpdateExpenseDto dto)
        {
            ValidateUserId(userId);
            ValidateExpenseDto(dto);

            var expense = new Expense
            {
                Id          = Guid.NewGuid(),
                UserId      = userId,
                Name        = dto.Name.Trim(),
                Amount      = dto.Amount,
                Category    = dto.Category?.Trim() ?? "Outros",
                Date        = NormalizeDate(dto.Date),
                ExpenseType = dto.ExpenseType ?? "Variável",
                Status      = dto.Status ?? "Pendente",
                Description = dto.Description?.Trim(),
                Notes       = dto.Notes?.Trim(),
                CreatedAt   = DateTime.UtcNow,
                UpdatedAt   = DateTime.UtcNow
            };

            await _expenseRepository.CreateAsync(expense);
            return MapToDto(expense);
        }

        public async Task<ExpenseDto> UpdateExpenseAsync(Guid userId, Guid expenseId, CreateUpdateExpenseDto dto)
        {
            ValidateUserId(userId);
            var expense = await GetAndValidateUserExpenseAsync(userId, expenseId);
            
            ValidateExpenseDto(dto);

            expense.Name        = dto.Name.Trim();
            expense.Amount      = dto.Amount;
            expense.Category    = dto.Category?.Trim() ?? "Outros";
            expense.Date        = NormalizeDate(dto.Date);
            expense.ExpenseType = dto.ExpenseType ?? "Variável";
            expense.Status      = dto.Status ?? "Pendente";
            expense.Description = dto.Description?.Trim();
            expense.Notes       = dto.Notes?.Trim();
            expense.UpdatedAt   = DateTime.UtcNow;

            await _expenseRepository.UpdateAsync(expense);
            return MapToDto(expense);
        }

        public async Task<ExpenseDto> MarkAsPaidAsync(Guid userId, Guid expenseId)
        {
            ValidateUserId(userId);
            var expense = await GetAndValidateUserExpenseAsync(userId, expenseId);

            if (expense.Status == "Pago")
                throw new InvalidOperationException($"A despesa {expenseId} já está marcada como paga.");

            expense.Status = "Pago";
            expense.UpdatedAt = DateTime.UtcNow;
            
            await _expenseRepository.UpdateAsync(expense);
            return MapToDto(expense);
        }

        public async Task DeleteExpenseAsync(Guid userId, Guid expenseId)
        {
            ValidateUserId(userId);
            var expense = await GetAndValidateUserExpenseAsync(userId, expenseId);
            await _expenseRepository.DeleteAsync(expenseId);
        }

        private async Task<Expense> GetAndValidateUserExpenseAsync(Guid userId, Guid expenseId)
        {
            var expense = await _expenseRepository.GetByIdAsync(expenseId);
            
            if (expense == null)
                throw new KeyNotFoundException($"Despesa com ID {expenseId} não encontrada.");

            if (expense.UserId != userId)
                throw new UnauthorizedAccessException($"A despesa {expenseId} não pertence ao usuário {userId}.");

            return expense;
        }

        private void ValidateExpenseDto(CreateUpdateExpenseDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.Name))
                throw new ArgumentException("O nome da despesa é obrigatório.");
            
            if (dto.Amount <= 0)
                throw new ArgumentException("O valor da despesa deve ser maior que zero.");
        }

        private static void ValidateUserId(Guid userId)
        {
            if (userId == Guid.Empty)
                throw new ArgumentException("UserId inválido.", nameof(userId));
        }

        private DateTime NormalizeDate(DateTime date)
        {
            return _dateTimeProvider.PreserveExactAppDateTime(date);
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