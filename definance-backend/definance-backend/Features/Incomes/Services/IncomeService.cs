using definance_backend.Domain.Entities;
using definance_backend.Features.Incomes.DTOs;
using definance_backend.Features.Incomes.Repositories;

namespace definance_backend.Features.Incomes.Services
{
    public class IncomeService : IIncomeService
    {
        private readonly IIncomeRepository _incomeRepository;

        public IncomeService(IIncomeRepository incomeRepository)
        {
            _incomeRepository = incomeRepository ?? throw new ArgumentNullException(nameof(incomeRepository));
        }

        public async Task<IncomeDto> GetIncomeByIdAsync(Guid userId, Guid incomeId)
        {
            var income = await _incomeRepository.GetByIdAsync(incomeId);
            
            if (income == null)
                throw new KeyNotFoundException("Renda não encontrada.");

            if (income.UserId != userId)
                throw new UnauthorizedAccessException("Esta renda não pertence a este usuário.");

            return MapToDto(income);
        }

        public async Task<IEnumerable<IncomeDto>> GetUserIncomesAsync(Guid userId, int? month = null, int? year = null, DateTime? startDate = null, DateTime? endDate = null)
        {
            var incomes = await _incomeRepository.GetByUserIdAsync(userId, month, year, startDate, endDate);
            return incomes.Select(MapToDto);
        }

        public async Task<IncomeDto> CreateIncomeAsync(Guid userId, CreateUpdateIncomeDto dto)
        {
            // Validação de tipo permitido
            var allowedTypes = new[] { "Fixa", "Variável", "Extra", "Investimento", "Investimentos", "CLT", "PJ", "Autônomo", "Freelancer", "Mesada / Auxílio", "Aluguel", "Outros" };
            if (!allowedTypes.Contains(dto.Type))
                throw new InvalidOperationException($"Tipo de renda inválido. Tipos permitidos: {string.Join(", ", allowedTypes)}");

            var income = new Income
            {
                Id = Guid.NewGuid(),
                UserId = userId,
                Name = dto.Name,
                Amount = dto.Amount,
                Type = dto.Type,
                Date = dto.Date == default ? DateTime.UtcNow : dto.Date,
                IsRecurring = dto.IsRecurring
            };

            await _incomeRepository.CreateAsync(income);
            return MapToDto(income);
        }

        public async Task<IncomeDto> UpdateIncomeAsync(Guid userId, Guid incomeId, CreateUpdateIncomeDto dto)
        {
            var income = await _incomeRepository.GetByIdAsync(incomeId);
            
            if (income == null)
                throw new KeyNotFoundException("Renda não encontrada.");

            if (income.UserId != userId)
                throw new UnauthorizedAccessException("Esta renda não pertence a este usuário.");

            // Validação de tipo permitido
            var allowedTypes = new[] { "Fixa", "Variável", "Extra", "Investimento", "Investimentos", "CLT", "PJ", "Autônomo", "Freelancer", "Mesada / Auxílio", "Aluguel", "Outros" };
            if (!allowedTypes.Contains(dto.Type))
                throw new InvalidOperationException($"Tipo de renda inválido. Tipos permitidos: {string.Join(", ", allowedTypes)}");

            income.Name = dto.Name;
            income.Amount = dto.Amount;
            income.Type = dto.Type;
            income.Date = dto.Date == default ? DateTime.UtcNow : dto.Date;
            income.IsRecurring = dto.IsRecurring;

            await _incomeRepository.UpdateAsync(income);
            return MapToDto(income);
        }

        public async Task DeleteIncomeAsync(Guid userId, Guid incomeId)
        {
            var income = await _incomeRepository.GetByIdAsync(incomeId);
            
            if (income == null)
                throw new KeyNotFoundException("Renda não encontrada.");

            if (income.UserId != userId)
                throw new UnauthorizedAccessException("Esta renda não pertence a este usuário.");

            await _incomeRepository.DeleteAsync(incomeId);
        }

        // Método único de mapeamento (DRY)
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