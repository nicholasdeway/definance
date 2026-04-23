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
            _incomeRepository = incomeRepository;
        }

        public async Task<IncomeDto> GetIncomeByIdAsync(Guid userId, Guid incomeId)
        {
            var income = await _incomeRepository.GetByIdAsync(incomeId);
            
            if (income == null)
            {
                throw new KeyNotFoundException("Renda não encontrada.");
            }

            if (income.UserId != userId)
            {
                throw new UnauthorizedAccessException("Esta renda não pertence a este usuário.");
            }

            return new IncomeDto
            {
                Id = income.Id,
                Name = income.Name,
                Amount = income.Amount,
                Type = income.Type,
                Date = income.Date,
                IsRecurring = income.IsRecurring
            };
        }

        public async Task<IEnumerable<IncomeDto>> GetUserIncomesAsync(Guid userId, int? month = null, int? year = null)
        {
            var incomes = await _incomeRepository.GetByUserIdAsync(userId, month, year);
            
            return incomes.Select(i => new IncomeDto
            {
                Id = i.Id,
                Name = i.Name,
                Amount = i.Amount,
                Type = i.Type,
                Date = i.Date,
                IsRecurring = i.IsRecurring
            });
        }

        public async Task<IncomeDto> CreateIncomeAsync(Guid userId, CreateUpdateIncomeDto dto)
        {
            var income = new Income
            {
                Id = Guid.NewGuid(),
                UserId = userId,
                Name = dto.Name,
                Amount = dto.Amount,
                Type = dto.Type,
                Date = dto.Date,
                IsRecurring = dto.IsRecurring
            };

            await _incomeRepository.CreateAsync(income);

            return new IncomeDto
            {
                Id = income.Id,
                Name = income.Name,
                Amount = income.Amount,
                Type = income.Type,
                Date = income.Date,
                IsRecurring = income.IsRecurring
            };
        }

        public async Task<IncomeDto> UpdateIncomeAsync(Guid userId, Guid incomeId, CreateUpdateIncomeDto dto)
        {
            var income = await _incomeRepository.GetByIdAsync(incomeId);
            
            if (income == null)
            {
                throw new KeyNotFoundException("Renda não encontrada.");
            }

            if (income.UserId != userId)
            {
                throw new UnauthorizedAccessException("Esta renda não pertence a este usuário.");
            }

            income.Name = dto.Name;
            income.Amount = dto.Amount;
            income.Type = dto.Type;
            income.Date = dto.Date;
            income.IsRecurring = dto.IsRecurring;

            await _incomeRepository.UpdateAsync(income);

            return new IncomeDto
            {
                Id = income.Id,
                Name = income.Name,
                Amount = income.Amount,
                Type = income.Type,
                Date = income.Date,
                IsRecurring = income.IsRecurring
            };
        }

        public async Task DeleteIncomeAsync(Guid userId, Guid incomeId)
        {
            var income = await _incomeRepository.GetByIdAsync(incomeId);
            
            if (income == null)
            {
                throw new KeyNotFoundException("Renda não encontrada.");
            }

            if (income.UserId != userId)
            {
                throw new UnauthorizedAccessException("Esta renda não pertence a este usuário.");
            }

            await _incomeRepository.DeleteAsync(incomeId);
        }
    }
}