using definance_backend.Domain.Entities;
using definance_backend.Features.Bills.DTOs;
using definance_backend.Features.Bills.Repositories;
using definance_backend.Features.Expenses.DTOs;
using definance_backend.Features.Expenses.Repositories;

namespace definance_backend.Features.Bills.Services
{
    public class BillService : IBillService
    {
        private readonly IBillRepository _billRepository;
        private readonly IExpenseRepository _expenseRepository;

        public BillService(IBillRepository billRepository, IExpenseRepository expenseRepository)
        {
            _billRepository = billRepository;
            _expenseRepository = expenseRepository;
        }

        public async Task<BillDto> GetBillByIdAsync(Guid userId, Guid billId)
        {
            var bill = await _billRepository.GetByIdAsync(billId);

            if (bill == null)
                throw new KeyNotFoundException("Conta não encontrada.");

            if (bill.UserId != userId)
                throw new UnauthorizedAccessException("Esta conta não pertence a este usuário.");

            return MapToDto(bill);
        }

        public async Task<IEnumerable<BillDto>> GetUserBillsAsync(Guid userId)
        {
            var bills = await _billRepository.GetByUserIdAsync(userId);
            return bills.Select(MapToDto);
        }

        public async Task<BillDto> CreateBillAsync(Guid userId, CreateUpdateBillDto dto)
        {
            var bill = new Bill
            {
                Id          = Guid.NewGuid(),
                UserId      = userId,
                Name        = dto.Name,
                Amount      = dto.Amount,
                Category    = dto.Category,
                BillType    = dto.BillType,
                DueDay      = dto.DueDay,
                DueDate     = dto.DueDate,
                Status      = dto.Status,
                IsRecurring = dto.IsRecurring,
                Description = dto.Description,
                Notes       = dto.Notes
            };

            await _billRepository.CreateAsync(bill);
            return MapToDto(bill);
        }

        public async Task<BillDto> UpdateBillAsync(Guid userId, Guid billId, CreateUpdateBillDto dto)
        {
            var bill = await _billRepository.GetByIdAsync(billId);

            if (bill == null)
                throw new KeyNotFoundException("Conta não encontrada.");

            if (bill.UserId != userId)
                throw new UnauthorizedAccessException("Esta conta não pertence a este usuário.");

            bill.Name        = dto.Name;
            bill.Amount      = dto.Amount;
            bill.Category    = dto.Category;
            bill.BillType    = dto.BillType;
            bill.DueDay      = dto.DueDay;
            bill.DueDate     = dto.DueDate;
            bill.Status      = dto.Status;
            bill.IsRecurring = dto.IsRecurring;
            bill.Description = dto.Description;
            bill.Notes       = dto.Notes;

            await _billRepository.UpdateAsync(bill);
            return MapToDto(bill);
        }

        public async Task<(BillDto Bill, ExpenseDto Expense)> PayBillAsync(Guid userId, Guid billId)
        {
            var bill = await _billRepository.GetByIdAsync(billId);

            if (bill == null)
                throw new KeyNotFoundException("Conta não encontrada.");

            if (bill.UserId != userId)
                throw new UnauthorizedAccessException("Esta conta não pertence a este usuário.");

            // 1. Atualiza status da conta
            bill.Status = "Pago";
            await _billRepository.UpdateAsync(bill);

            // 2. Cria despesa vinculada automaticamente
            var expense = new Expense
            {
                Id          = Guid.NewGuid(),
                UserId      = userId,
                Name        = bill.Name,
                Amount      = bill.Amount,
                Category    = bill.Category,
                Date        = DateTime.UtcNow,
                ExpenseType = bill.BillType,
                Status      = "Pago",
                BillId      = bill.Id,
                DueDate     = bill.DueDate,
                Description = bill.Description,
                Notes       = bill.Notes
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

            return (MapToDto(bill), expenseDto);
        }

        public async Task DeleteBillAsync(Guid userId, Guid billId)
        {
            var bill = await _billRepository.GetByIdAsync(billId);

            if (bill == null)
                throw new KeyNotFoundException("Conta não encontrada.");

            if (bill.UserId != userId)
                throw new UnauthorizedAccessException("Esta conta não pertence a este usuário.");

            await _billRepository.DeleteAsync(billId);
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