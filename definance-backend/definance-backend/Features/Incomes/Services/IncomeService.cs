using definance_backend.Domain.Entities;
using definance_backend.Features.Incomes.DTOs;
using definance_backend.Features.Incomes.Repositories;
using definance_backend.Features.Shared.Services;

namespace definance_backend.Features.Incomes.Services
{
    public class IncomeService : IIncomeService
    {
        private readonly IIncomeRepository _incomeRepository;
        private readonly IDateTimeProvider _dateTimeProvider;

        public IncomeService(IIncomeRepository incomeRepository, IDateTimeProvider dateTimeProvider)
        {
            _incomeRepository = incomeRepository ?? throw new ArgumentNullException(nameof(incomeRepository));
            _dateTimeProvider = dateTimeProvider ?? throw new ArgumentNullException(nameof(dateTimeProvider));
        }

        public async Task<IncomeDto> GetIncomeByIdAsync(Guid userId, Guid incomeId)
        {
            ValidateUserId(userId);
            var income = await GetAndValidateUserIncomeAsync(userId, incomeId);
            return MapToDto(income);
        }

        public async Task<IEnumerable<IncomeDto>> GetUserIncomesAsync(Guid userId, int? month = null, int? year = null, DateTime? startDate = null, DateTime? endDate = null)
        {
            ValidateUserId(userId);
            var incomes = await _incomeRepository.GetByUserIdAsync(userId, month, year, startDate, endDate);
            return incomes.Select(MapToDto);
        }

        public async Task<IncomeDto> CreateIncomeAsync(Guid userId, CreateUpdateIncomeDto dto)
        {
            ValidateUserId(userId);
            ValidateIncomeDto(dto);

            var income = new Income
            {
                Id = Guid.NewGuid(),
                UserId = userId,
                Name = dto.Name.Trim(),
                Amount = dto.Amount,
                Type = dto.Type.Trim(),
                Date = NormalizeDate(dto.Date),
                IsRecurring = dto.IsRecurring,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            await _incomeRepository.CreateAsync(income);
            return MapToDto(income);
        }

        public async Task<IncomeDto> UpdateIncomeAsync(Guid userId, Guid incomeId, CreateUpdateIncomeDto dto)
        {
            ValidateUserId(userId);
            var income = await GetAndValidateUserIncomeAsync(userId, incomeId);
            
            ValidateIncomeDto(dto);

            income.Name = dto.Name.Trim();
            income.Amount = dto.Amount;
            income.Type = dto.Type.Trim();
            income.Date = NormalizeDate(dto.Date);
            income.IsRecurring = dto.IsRecurring;
            income.UpdatedAt = DateTime.UtcNow;

            await _incomeRepository.UpdateAsync(income);
            return MapToDto(income);
        }

        public async Task DeleteIncomeAsync(Guid userId, Guid incomeId)
        {
            ValidateUserId(userId);
            var income = await GetAndValidateUserIncomeAsync(userId, incomeId);
            await _incomeRepository.DeleteAsync(incomeId);
        }

        private async Task<Income> GetAndValidateUserIncomeAsync(Guid userId, Guid incomeId)
        {
            var income = await _incomeRepository.GetByIdAsync(incomeId);
            
            if (income == null)
                throw new KeyNotFoundException($"Renda com ID {incomeId} não encontrada.");

            if (income.UserId != userId)
                throw new UnauthorizedAccessException($"A renda {incomeId} não pertence ao usuário {userId}.");

            return income;
        }

        private void ValidateIncomeDto(CreateUpdateIncomeDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.Name))
                throw new ArgumentException("O nome da renda é obrigatório.");
            
            if (dto.Amount <= 0)
                throw new ArgumentException("O valor da renda deve ser maior que zero.");
            
            if (string.IsNullOrWhiteSpace(dto.Type))
                throw new ArgumentException("O tipo da renda é obrigatório.");
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

        private static IncomeDto MapToDto(Income income) => new()
        {
            Id = income.Id,
            Name = income.Name,
            Amount = income.Amount,
            Type = income.Type,
            Date = income.Date,
            IsRecurring = income.IsRecurring
        };
    }
}