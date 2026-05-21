using definance_backend.Domain.Entities;
using definance_backend.Features.Bills.Repositories;
using definance_backend.Features.Expenses.Repositories;
using definance_backend.Features.Goals.DTOs;
using definance_backend.Features.Goals.Repositories;
using definance_backend.Features.Shared.Services;
using System.Transactions;

namespace definance_backend.Features.Goals.Services
{
    public class GoalService : IGoalService
    {
        private readonly IGoalRepository _goalRepository;
        private readonly IBillRepository _billRepository;
        private readonly IExpenseRepository _expenseRepository;
        private readonly IDateTimeProvider _dateTimeProvider;

        public GoalService(
            IGoalRepository goalRepository, 
            IBillRepository billRepository, 
            IExpenseRepository expenseRepository,
            IDateTimeProvider dateTimeProvider)
        {
            _goalRepository = goalRepository;
            _billRepository = billRepository;
            _expenseRepository = expenseRepository;
            _dateTimeProvider = dateTimeProvider;
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
            using var transaction = new TransactionScope(TransactionScopeAsyncFlowOption.Enabled);
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
                StartDate = dto.StartDate.HasValue ? _dateTimeProvider.NormalizeToAppDate(dto.StartDate.Value) : (DateTime?)null,
                EndDate = dto.EndDate.HasValue ? _dateTimeProvider.NormalizeToAppDate(dto.EndDate.Value) : (DateTime?)null,
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
                var now = _dateTimeProvider.GetCurrentAppDate();
                DateTime dueDate;
                
                // Se o dia da reserva já passou este mês, joga para o próximo mês
                if (now.Day > dto.ReserveDay)
                {
                    var nextMonth = now.AddMonths(1);
                    int lastDay = DateTime.DaysInMonth(nextMonth.Year, nextMonth.Month);
                    dueDate = _dateTimeProvider.NormalizeToAppDate(new DateTime(nextMonth.Year, nextMonth.Month, Math.Min(dto.ReserveDay, lastDay), 12, 0, 0, DateTimeKind.Utc));
                }
                else
                {
                    int lastDay = DateTime.DaysInMonth(now.Year, now.Month);
                    dueDate = _dateTimeProvider.NormalizeToAppDate(new DateTime(now.Year, now.Month, Math.Min(dto.ReserveDay, lastDay), 12, 0, 0, DateTimeKind.Utc));
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

            transaction.Complete();
            return MapToDto(goal);
        }

        public async Task<GoalDto> UpdateGoalAsync(Guid userId, Guid goalId, CreateUpdateGoalDto dto)
        {
            using var transaction = new TransactionScope(TransactionScopeAsyncFlowOption.Enabled);
            var goal = await _goalRepository.GetByIdAsync(goalId);

            if (goal == null)
                throw new KeyNotFoundException("Meta não encontrada.");

            if (goal.UserId != userId)
                throw new UnauthorizedAccessException("Esta meta não pertence a este usuário.");

            goal.Name = dto.Name;
            goal.TargetAmount = dto.TargetAmount;
            goal.Category = dto.Category;
            goal.StartDate = dto.StartDate.HasValue ? _dateTimeProvider.NormalizeToAppDate(dto.StartDate.Value) : (DateTime?)null;
            goal.EndDate = dto.EndDate.HasValue ? _dateTimeProvider.NormalizeToAppDate(dto.EndDate.Value) : (DateTime?)null;
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
                        var now = _dateTimeProvider.GetCurrentAppDate();
                        if (now.Day > dto.ReserveDay)
                        {
                            var nextMonth = now.AddMonths(1);
                            int lastDay = DateTime.DaysInMonth(nextMonth.Year, nextMonth.Month);
                            bill.DueDate = _dateTimeProvider.NormalizeToAppDate(new DateTime(nextMonth.Year, nextMonth.Month, Math.Min(dto.ReserveDay, lastDay), 12, 0, 0, DateTimeKind.Utc));
                        }
                        else
                        {
                            int lastDay = DateTime.DaysInMonth(now.Year, now.Month);
                            bill.DueDate = _dateTimeProvider.NormalizeToAppDate(new DateTime(now.Year, now.Month, Math.Min(dto.ReserveDay, lastDay), 12, 0, 0, DateTimeKind.Utc));
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
                var now = _dateTimeProvider.GetCurrentAppDate();
                DateTime dueDate;
                if (now.Day > dto.ReserveDay)
                {
                    var nextMonth = now.AddMonths(1);
                    int lastDay = DateTime.DaysInMonth(nextMonth.Year, nextMonth.Month);
                    dueDate = _dateTimeProvider.NormalizeToAppDate(new DateTime(nextMonth.Year, nextMonth.Month, Math.Min(dto.ReserveDay, lastDay), 12, 0, 0, DateTimeKind.Utc));
                }
                else
                {
                    int lastDay = DateTime.DaysInMonth(now.Year, now.Month);
                    dueDate = _dateTimeProvider.NormalizeToAppDate(new DateTime(now.Year, now.Month, Math.Min(dto.ReserveDay, lastDay), 12, 0, 0, DateTimeKind.Utc));
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
            transaction.Complete();
            return MapToDto(goal);
        }

        public async Task<GoalDto> DepositAsync(Guid userId, Guid goalId, DepositGoalDto dto)
        {
            using var transaction = new TransactionScope(TransactionScopeAsyncFlowOption.Enabled);
            var goal = await _goalRepository.GetByIdAsync(goalId);

            if (goal == null)
                throw new KeyNotFoundException("Meta não encontrada.");

            if (goal.UserId != userId)
                throw new UnauthorizedAccessException("Esta meta não pertence a este usuário.");

            decimal depositAmount = Math.Round(dto.Amount, 2, MidpointRounding.AwayFromZero);
            goal.CurrentAmount += depositAmount;
            
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

            // Criar a conta correspondente já marcada como "Pago" em "Minhas Contas" (Bills)
            var appNow = _dateTimeProvider.GetExactAppDateTime();
            var billId = Guid.NewGuid();
            var newBill = new Bill
            {
                Id          = billId,
                UserId      = userId,
                Name        = $"Depósito: {goal.Name}",
                Amount      = depositAmount,
                Category    = goal.Category,
                BillType    = "Variável",
                DueDay      = appNow.Day,
                DueDate     = appNow,
                Status      = "Pago",
                IsRecurring = false,
                GoalId      = goal.Id,
                Description = $"Depósito manual na meta: {goal.Name}",
                CreatedAt   = DateTime.UtcNow,
                UpdatedAt   = DateTime.UtcNow
            };
            await _billRepository.CreateAsync(newBill);

            // Criar a despesa correspondente em "Saídas/Histórico" (Expenses)
            var newExpense = new Expense
            {
                Id          = Guid.NewGuid(),
                UserId      = userId,
                Name        = $"Depósito: {goal.Name}",
                Amount      = depositAmount,
                Category    = goal.Category,
                Date        = appNow, // AWS server-normalized timezone datetime
                ExpenseType = "Variável",
                Status      = "Pago",
                BillId      = billId,
                Description = $"Depósito manual na meta: {goal.Name}",
                CreatedAt   = DateTime.UtcNow,
                UpdatedAt   = DateTime.UtcNow
            };
            await _expenseRepository.CreateAsync(newExpense);

            goal.UpdatedAt = DateTime.UtcNow;
            await _goalRepository.UpdateAsync(goal);
            transaction.Complete();
            return MapToDto(goal);
        }

        public async Task DeleteGoalAsync(Guid userId, Guid goalId, bool deleteTransactions)
        {
            var goal = await _goalRepository.GetByIdAsync(goalId);

            if (goal == null)
                throw new KeyNotFoundException("Meta não encontrada.");

            if (goal.UserId != userId)
                throw new UnauthorizedAccessException("Esta meta não pertence a este usuário.");

            await _goalRepository.DeleteWithCascadeAsync(goalId, userId, deleteTransactions);
        }

        public async Task<IEnumerable<GoalHistoryDto>> GetGoalHistoryAsync(Guid userId, Guid goalId)
        {
            var goal = await _goalRepository.GetByIdAsync(goalId);
            if (goal == null)
                throw new KeyNotFoundException("Meta não encontrada.");

            if (goal.UserId != userId)
                throw new UnauthorizedAccessException("Esta meta não pertence a este usuário.");

            return await _goalRepository.GetGoalHistoryAsync(userId, goalId);
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