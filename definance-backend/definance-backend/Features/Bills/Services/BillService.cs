using definance_backend.Domain.Entities;
using definance_backend.Features.Bills.DTOs;
using definance_backend.Features.Bills.Repositories;
using definance_backend.Features.Expenses.DTOs;
using definance_backend.Features.Expenses.Repositories;
using definance_backend.Features.Goals.Repositories;
using definance_backend.Features.Onboarding.Services;
using definance_backend.Features.Shared.Services;
using System.Transactions;
using System.Text.RegularExpressions;

namespace definance_backend.Features.Bills.Services
{
    public class BillService : IBillService
    {
        private readonly IBillRepository _billRepository;
        private readonly IExpenseRepository _expenseRepository;
        private readonly IGoalRepository _goalRepository;
        private readonly IOnboardingService _onboardingService;
        private readonly IDateTimeProvider _dateTimeProvider;

        private static readonly Regex InstallmentPattern = new(
            @"^(.*?) \((\d+)/(\d+)\)$", 
            RegexOptions.Compiled);

        private static readonly HashSet<string> ValidBillTypes = new(StringComparer.OrdinalIgnoreCase)
        {
            "Fixa", "Variável", "Parcelada"
        };

        public BillService(
            IBillRepository billRepository, 
            IExpenseRepository expenseRepository,
            IGoalRepository goalRepository,
            IOnboardingService onboardingService,
            IDateTimeProvider dateTimeProvider)
        {
            _billRepository = billRepository ?? throw new ArgumentNullException(nameof(billRepository));
            _expenseRepository = expenseRepository ?? throw new ArgumentNullException(nameof(expenseRepository));
            _goalRepository = goalRepository ?? throw new ArgumentNullException(nameof(goalRepository));
            _onboardingService = onboardingService ?? throw new ArgumentNullException(nameof(onboardingService));
            _dateTimeProvider = dateTimeProvider ?? throw new ArgumentNullException(nameof(dateTimeProvider));
        }

        public async Task<BillDto> GetBillByIdAsync(Guid userId, Guid billId)
        {
            ValidateUserId(userId);
            var bill = await GetAndValidateUserBillAsync(userId, billId);
            return MapToDto(bill);
        }

        public async Task<IEnumerable<BillDto>> GetUserBillsAsync(Guid userId, int? month = null, int? year = null, DateTime? startDate = null, DateTime? endDate = null)
        {
            ValidateUserId(userId);
            var bills = await _billRepository.GetByUserIdAsync(userId, month, year, startDate, endDate);
            return bills.Select(MapToDto);
        }

        public async Task<BillDto> CreateBillAsync(Guid userId, CreateUpdateBillDto dto)
        {
            ValidateUserId(userId);
            ValidateBillDto(dto);

            if (dto.IsParcelado && (dto.ParcelasTotal ?? 0) > 0)
            {
                var newBills = new List<Bill>();
                int total = dto.ParcelasTotal!.Value;
                int pagas = dto.ParcelasPagas ?? 0;
                int restantes = total - pagas;
                
                // Distribuição de resíduo de centavos (Ponto 3)
                decimal valorParcelaBase = Math.Floor((dto.Amount / total) * 100) / 100;
                decimal residuoTotal = dto.Amount - (valorParcelaBase * total);
                
                DateTime baseDate = NormalizeDate(dto.DueDate ?? DateTime.UtcNow);

                for (int i = 1; i <= restantes; i++)
                {
                    int numeroParcela = pagas + i;
                    DateTime installmentDate = baseDate.AddMonths(i - 1);
                    
                    // Adiciona o resíduo na primeira parcela restante para garantir que a soma feche
                    decimal valorFinalParcela = (i == 1) ? valorParcelaBase + residuoTotal : valorParcelaBase;
                    
                    newBills.Add(new Bill
                    {
                        Id = Guid.NewGuid(),
                        UserId = userId,
                        Name = $"{dto.Name.Trim()} ({numeroParcela}/{total})",
                        Amount = valorFinalParcela,
                        Category = dto.Category?.Trim() ?? "Outros",
                        BillType = "Parcelada", // Identifica como parcelada (Ponto 1)
                        DueDay = installmentDate.Day,
                        DueDate = installmentDate,
                        Status = dto.Status ?? "Pendente",
                        IsRecurring = false,
                        Description = string.IsNullOrEmpty(dto.Description) 
                            ? $"Conta Parcelada ({numeroParcela}/{total})" 
                            : $"{dto.Description.Trim()} ({numeroParcela}/{total})",
                        Notes = dto.Notes?.Trim(),
                        CreatedAt = DateTime.UtcNow,
                        UpdatedAt = DateTime.UtcNow
                    });
                }

                await _billRepository.CreateBatchAsync(newBills);
                return MapToDto(newBills.First());
            }

            var bill = new Bill
            {
                Id          = Guid.NewGuid(),
                UserId      = userId,
                Name        = dto.Name.Trim(),
                Amount      = dto.Amount,
                Category    = dto.Category?.Trim() ?? "Outros",
                BillType    = dto.BillType ?? "Fixa",
                DueDay      = dto.DueDay,
                DueDate     = dto.DueDate.HasValue ? NormalizeDate(dto.DueDate.Value) : null,
                Status      = dto.Status ?? "Pendente",
                IsRecurring = dto.IsRecurring,
                Description = dto.Description?.Trim(),
                Notes       = dto.Notes?.Trim(),
                CreatedAt   = DateTime.UtcNow,
                UpdatedAt   = DateTime.UtcNow
            };

            await _billRepository.CreateAsync(bill);
            return MapToDto(bill);
        }

        public async Task<BillDto> UpdateBillAsync(Guid userId, Guid billId, CreateUpdateBillDto dto)
        {
            ValidateUserId(userId);
            var bill = await GetAndValidateUserBillAsync(userId, billId);
            ValidateBillDto(dto);

            bill.Name        = dto.Name.Trim();
            bill.Amount      = dto.Amount;
            bill.Category    = dto.Category?.Trim() ?? "Outros";
            bill.BillType    = dto.BillType ?? "Fixa";
            bill.DueDay      = dto.DueDay;
            bill.DueDate     = dto.DueDate.HasValue ? NormalizeDate(dto.DueDate.Value) : null;
            bill.Status      = dto.Status ?? "Pendente";
            bill.IsRecurring = dto.IsRecurring;
            bill.Description = dto.Description?.Trim();
            bill.Notes       = dto.Notes?.Trim();
            bill.UpdatedAt   = DateTime.UtcNow;

            await _billRepository.UpdateAsync(bill);
            return MapToDto(bill);
        }

        public async Task<(BillDto Bill, ExpenseDto Expense)> PayBillAsync(Guid userId, Guid billId, DateTime? paymentDate = null)
        {
            ValidateUserId(userId);
            using var transaction = new TransactionScope(TransactionScopeAsyncFlowOption.Enabled);

            var bill = await GetAndValidateUserBillAsync(userId, billId);
            DateTime finalPaymentDate = paymentDate.HasValue ? _dateTimeProvider.PreserveExactAppDateTime(paymentDate.Value) : _dateTimeProvider.GetExactAppDateTime();

            bill.Status = "Pago";
            bill.UpdatedAt = DateTime.UtcNow;
            await _billRepository.UpdateAsync(bill);

            if (bill.IsRecurring)
            {
                DateTime? nextDueDate = null;

                if (bill.DueDate.HasValue)
                {
                    nextDueDate = bill.DueDate.Value.AddMonths(1);
                }
                else if (bill.DueDay.HasValue)
                {
                    var nextMonth = DateTime.UtcNow.AddMonths(1);
                    var day = Math.Min(bill.DueDay.Value, DateTime.DaysInMonth(nextMonth.Year, nextMonth.Month));
                    nextDueDate = new DateTime(nextMonth.Year, nextMonth.Month, day, 12, 0, 0, DateTimeKind.Utc);
                }

                if (nextDueDate.HasValue)
                {
                    // Verificação de duplicidade aprimorada (Ponto 2)
                    var userBills = await _billRepository.GetByUserIdAsync(userId, nextDueDate.Value.Month, nextDueDate.Value.Year);
                    var exists = userBills.Any(b => 
                        b.Name == bill.Name && 
                        b.Category == bill.Category && 
                        b.Amount == bill.Amount &&
                        b.Status == "Pendente");

                    if (!exists)
                    {
                        var nextBill = new Bill
                        {
                            Id = Guid.NewGuid(),
                            UserId = userId,
                            Name = bill.Name,
                            Amount = bill.Amount,
                            Category = bill.Category,
                            BillType = bill.BillType,
                            DueDay = bill.DueDay,
                            DueDate = nextDueDate,
                            Status = "Pendente",
                            IsRecurring = true,
                            Description = bill.Description?.Contains("(Instância)") == true ? bill.Description : bill.Description + " (Instância)",
                            Notes = bill.Notes,
                            CreatedAt = DateTime.UtcNow,
                            UpdatedAt = DateTime.UtcNow
                        };

                        await _billRepository.CreateAsync(nextBill);
                    }
                }
            }

            if (bill.GoalId.HasValue)
            {
                var goal = await _goalRepository.GetByIdAsync(bill.GoalId.Value);
                if (goal != null)
                {
                    goal.CurrentAmount += bill.Amount;
                    if (goal.CurrentAmount >= goal.TargetAmount)
                    {
                        goal.IsCompleted = true;
                        bill.Status = "Extinta"; 
                        await _billRepository.UpdateAsync(bill);
                    }
                    goal.UpdatedAt = DateTime.UtcNow;
                    await _goalRepository.UpdateAsync(goal);
                }
            }

            var expense = new Expense
            {
                Id          = Guid.NewGuid(),
                UserId      = userId,
                Name        = bill.Name,
                Amount      = bill.Amount,
                Category    = bill.Category,
                Date        = finalPaymentDate,
                ExpenseType = bill.BillType,
                Status      = "Pago",
                BillId      = bill.Id,
                DueDate     = bill.DueDate, 
                Description = bill.Description,
                Notes       = bill.Notes,
                CreatedAt   = DateTime.UtcNow,
                UpdatedAt   = DateTime.UtcNow
            };

            await _expenseRepository.CreateAsync(expense);

            var expenseDto = new ExpenseDto
            {
                Id          = expense.Id,
                Name        = expense.Name,
                Amount      = expense.Amount,
                Category    = expense.Category,
                Date        = expense.Date,
                ExpenseType = expense.ExpenseType,
                Status      = expense.Status,
                BillId      = expense.BillId,
                DueDate     = expense.DueDate
            };

            transaction.Complete();
            return (MapToDto(bill), expenseDto);
        }

        public async Task DeleteBillAsync(Guid userId, Guid billId, bool deleteAllInstallments = false)
        {
            ValidateUserId(userId);
            var bill = await GetAndValidateUserBillAsync(userId, billId);

            if (deleteAllInstallments)
            {
                var match = InstallmentPattern.Match(bill.Name);
                if (match.Success)
                {
                    var baseName = match.Groups[1].Value.Trim();
                    var totalParcelas = match.Groups[3].Value;
                    
                    var allBills = await _billRepository.GetByUserIdAsync(userId);
                    
                    var installmentsToDelete = allBills.Where(b => 
                        b.Status != "Pago" && 
                        InstallmentPattern.IsMatch(b.Name) &&
                        b.Name.StartsWith(baseName) &&
                        b.Name.EndsWith($"/{totalParcelas})")
                    ).ToList();

                    foreach(var inst in installmentsToDelete)
                    {
                        await _onboardingService.SyncDeleteBillWithProfileAsync(userId, inst);
                        await _billRepository.DeleteAsync(inst.Id);
                    }
                    return;
                }
            }

            await _onboardingService.SyncDeleteBillWithProfileAsync(userId, bill);
            await _billRepository.DeleteAsync(billId);
        }

        private async Task<Bill> GetAndValidateUserBillAsync(Guid userId, Guid billId)
        {
            var bill = await _billRepository.GetByIdAsync(billId);
            
            if (bill == null)
                throw new KeyNotFoundException($"Conta com ID {billId} não encontrada.");

            if (bill.UserId != userId)
                throw new UnauthorizedAccessException($"A conta {billId} não pertence ao usuário {userId}.");

            return bill;
        }

        private void ValidateBillDto(CreateUpdateBillDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.Name))
                throw new ArgumentException("O nome da conta é obrigatório.");
            
            if (dto.Amount <= 0)
                throw new ArgumentException("O valor da conta deve ser maior que zero.");

            if (!string.IsNullOrWhiteSpace(dto.BillType) && !ValidBillTypes.Contains(dto.BillType))
                throw new ArgumentException($"O tipo da conta deve ser um dos seguintes: {string.Join(", ", ValidBillTypes)}.");
        }

        private static void ValidateUserId(Guid userId)
        {
            if (userId == Guid.Empty)
                throw new ArgumentException("UserId inválido.", nameof(userId));
        }

        private DateTime NormalizeDate(DateTime date)
        {
            return _dateTimeProvider.NormalizeToAppDate(date);
        }

        private static BillDto MapToDto(Bill bill) => new()
        {
            Id          = bill.Id,
            Name        = bill.Name,
            Amount      = bill.Amount,
            Category    = bill.Category,
            BillType    = bill.BillType,
            DueDay      = bill.DueDay,
            DueDate     = bill.DueDate,
            Status      = bill.Status,
            IsRecurring = bill.IsRecurring,
            Description = bill.Description,
            Notes       = bill.Notes
        };
    }
}