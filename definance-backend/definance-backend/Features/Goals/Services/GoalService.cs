using definance_backend.Domain.Entities;
using definance_backend.Features.Bills.Repositories;
using definance_backend.Features.Goals.DTOs;
using definance_backend.Features.Goals.Repositories;

namespace definance_backend.Features.Goals.Services
{
    public class GoalService : IGoalService
    {
        private readonly IGoalRepository _goalRepository;
        private readonly IBillRepository _billRepository;

        public GoalService(IGoalRepository goalRepository, IBillRepository billRepository)
        {
            _goalRepository = goalRepository;
            _billRepository = billRepository;
        }

        public async Task<GoalDto> GetGoalByIdAsync(Guid userId, Guid goalId)
        {
            var goal = await _goalRepository.GetByIdAsync(goalId);

            if (goal == null)
                throw new KeyNotFoundException("Meta não encontrada.");

            if (goal.UserId != userId)
                throw new UnauthorizedAccessException("Esta meta não pertence a este usuário.");

            return MapToDto(goal);
        }

        public async Task<IEnumerable<GoalDto>> GetUserGoalsAsync(Guid userId)
        {
            var goals = await _goalRepository.GetByUserIdAsync(userId);

            return goals.Select(MapToDto);
        }

        public async Task<GoalDto> CreateGoalAsync(Guid userId, CreateUpdateGoalDto dto)
        {
            var goalId = Guid.NewGuid();

            // Criamos a meta primeiro para satisfazer a FK em 'bills'
            var goal = new Goal
            {
                Id = goalId,
                UserId = userId,
                Name = dto.Name,
                TargetAmount = dto.TargetAmount,
                CurrentAmount = 0,
                Category = dto.Category,
                StartDate = dto.StartDate,
                EndDate = dto.EndDate,
                MonthlyReserve = dto.MonthlyReserve,
                ReserveDay = dto.ReserveDay,
                IsCompleted = false,
                LinkedBillId = null
            };

            await _goalRepository.CreateAsync(goal);

            // Se houver reserva mensal, criamos a Bill vinculada e atualizamos a meta
            if (dto.MonthlyReserve > 0)
            {
                // Calcula a data de vencimento baseada no dia da reserva
                var now = DateTime.UtcNow;
                DateTime dueDate;
                
                // Se o dia da reserva já passou este mês, joga para o próximo mês
                if (now.Day > dto.ReserveDay)
                {
                    var nextMonth = now.AddMonths(1);
                    int lastDay = DateTime.DaysInMonth(nextMonth.Year, nextMonth.Month);
                    dueDate = new DateTime(nextMonth.Year, nextMonth.Month, Math.Min(dto.ReserveDay, lastDay));
                }
                else
                {
                    int lastDay = DateTime.DaysInMonth(now.Year, now.Month);
                    dueDate = new DateTime(now.Year, now.Month, Math.Min(dto.ReserveDay, lastDay));
                }

                var bill = new Bill
                {
                    Id = Guid.NewGuid(),
                    UserId = userId,
                    Name = $"Reserva: {dto.Name}",
                    Amount = dto.MonthlyReserve,
                    Category = dto.Category,
                    BillType = "Fixa",
                    DueDay = dto.ReserveDay,
                    DueDate = dueDate,
                    Status = "Pendente",
                    IsRecurring = true,
                    GoalId = goalId,
                    Description = $"Reserva automática mensal para a meta: {dto.Name}"
                };

                await _billRepository.CreateAsync(bill);
                
                // Atualiza a meta com o ID da bill vinculada
                goal.LinkedBillId = bill.Id;
                await _goalRepository.UpdateAsync(goal);
            }

            return MapToDto(goal);
        }

        public async Task<GoalDto> UpdateGoalAsync(Guid userId, Guid goalId, CreateUpdateGoalDto dto)
        {
            var goal = await _goalRepository.GetByIdAsync(goalId);

            if (goal == null)
                throw new KeyNotFoundException("Meta não encontrada.");

            if (goal.UserId != userId)
                throw new UnauthorizedAccessException("Esta meta não pertence a este usuário.");

            goal.Name = dto.Name;
            goal.TargetAmount = dto.TargetAmount;
            goal.Category = dto.Category;
            goal.StartDate = dto.StartDate;
            goal.EndDate = dto.EndDate;
            goal.MonthlyReserve = dto.MonthlyReserve;
            goal.ReserveDay = dto.ReserveDay;
            goal.UpdatedAt = DateTime.UtcNow;

            // Sincronizar Bill vinculada
            if (goal.LinkedBillId.HasValue)
            {
                var bill = await _billRepository.GetByIdAsync(goal.LinkedBillId.Value);
                if (bill != null)
                {
                    if (dto.MonthlyReserve > 0)
                    {
                        // Atualiza conta existente
                        bill.Name = $"Reserva: {dto.Name}";
                        bill.Amount = dto.MonthlyReserve;
                        bill.DueDay = dto.ReserveDay;
                        bill.Category = dto.Category;
                        
                        // Recalcula DueDate se o dia mudou
                        var now = DateTime.UtcNow;
                        if (now.Day > dto.ReserveDay)
                        {
                            var nextMonth = now.AddMonths(1);
                            int lastDay = DateTime.DaysInMonth(nextMonth.Year, nextMonth.Month);
                            bill.DueDate = new DateTime(nextMonth.Year, nextMonth.Month, Math.Min(dto.ReserveDay, lastDay));
                        }
                        else
                        {
                            int lastDay = DateTime.DaysInMonth(now.Year, now.Month);
                            bill.DueDate = new DateTime(now.Year, now.Month, Math.Min(dto.ReserveDay, lastDay));
                        }

                        await _billRepository.UpdateAsync(bill);
                    }
                    else
                    {
                        // Removeu a reserva: deleta a conta vinculada
                        await _billRepository.DeleteAsync(bill.Id);
                        goal.LinkedBillId = null;
                    }
                }
            }
            else if (dto.MonthlyReserve > 0)
            {
                var now = DateTime.UtcNow;
                DateTime dueDate;
                if (now.Day > dto.ReserveDay)
                {
                    var nextMonth = now.AddMonths(1);
                    int lastDay = DateTime.DaysInMonth(nextMonth.Year, nextMonth.Month);
                    dueDate = new DateTime(nextMonth.Year, nextMonth.Month, Math.Min(dto.ReserveDay, lastDay));
                }
                else
                {
                    int lastDay = DateTime.DaysInMonth(now.Year, now.Month);
                    dueDate = new DateTime(now.Year, now.Month, Math.Min(dto.ReserveDay, lastDay));
                }

                var bill = new Bill
                {
                    Id = Guid.NewGuid(),
                    UserId = userId,
                    Name = $"Reserva: {dto.Name}",
                    Amount = dto.MonthlyReserve,
                    Category = dto.Category,
                    BillType = "Fixa",
                    DueDay = dto.ReserveDay,
                    DueDate = dueDate,
                    Status = "Pendente",
                    IsRecurring = true,
                    GoalId = goal.Id,
                    Description = $"Reserva automática mensal para a meta: {dto.Name}"
                };

                await _billRepository.CreateAsync(bill);
                goal.LinkedBillId = bill.Id;
            }

            await _goalRepository.UpdateAsync(goal);
            return MapToDto(goal);
        }

        public async Task<GoalDto> DepositAsync(Guid userId, Guid goalId, DepositGoalDto dto)
        {
            var goal = await _goalRepository.GetByIdAsync(goalId);

            if (goal == null)
                throw new KeyNotFoundException("Meta não encontrada.");

            if (goal.UserId != userId)
                throw new UnauthorizedAccessException("Esta meta não pertence a este usuário.");

            goal.CurrentAmount += Math.Round(dto.Amount, 2, MidpointRounding.AwayFromZero);
            
            if (goal.CurrentAmount >= goal.TargetAmount)
            {
                goal.IsCompleted = true;
                
                // Se concluída, extinguimos a bill vinculada se existir
                if (goal.LinkedBillId.HasValue)
                {
                    var bill = await _billRepository.GetByIdAsync(goal.LinkedBillId.Value);
                    if (bill != null)
                    {
                        bill.Status = "Extinta";
                        await _billRepository.UpdateAsync(bill);
                    }
                }
            }

            goal.UpdatedAt = DateTime.UtcNow;
            await _goalRepository.UpdateAsync(goal);
            return MapToDto(goal);
        }

        public async Task DeleteGoalAsync(Guid userId, Guid goalId)
        {
            var goal = await _goalRepository.GetByIdAsync(goalId);

            if (goal == null)
                throw new KeyNotFoundException("Meta não encontrada.");

            if (goal.UserId != userId)
                throw new UnauthorizedAccessException("Esta meta não pertence a este usuário.");

            if (goal.LinkedBillId.HasValue)
            {
                var bill = await _billRepository.GetByIdAsync(goal.LinkedBillId.Value);
                if (bill != null && bill.GoalId == goalId)
                {
                    await _billRepository.DeleteAsync(bill.Id);
                }
            }

            await _goalRepository.DeleteAsync(goalId, userId);
        }

        private static GoalDto MapToDto(Goal goal) => new()
        {
            Id = goal.Id,
            Name = goal.Name,
            TargetAmount = goal.TargetAmount,
            CurrentAmount = goal.CurrentAmount,
            Category = goal.Category,
            StartDate = goal.StartDate,
            EndDate = goal.EndDate,
            MonthlyReserve = goal.MonthlyReserve,
            ReserveDay = goal.ReserveDay,
            IsCompleted = goal.IsCompleted,
            LinkedBillId = goal.LinkedBillId
        };
    }
}