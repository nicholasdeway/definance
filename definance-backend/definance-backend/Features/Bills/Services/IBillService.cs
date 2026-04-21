using definance_backend.Features.Bills.DTOs;
using definance_backend.Features.Bills.Repositories;
using definance_backend.Features.Expenses.DTOs;

namespace definance_backend.Features.Bills.Services
{
    public interface IBillService
    {
        Task<BillDto> GetBillByIdAsync(Guid userId, Guid billId);
        Task<IEnumerable<BillDto>> GetUserBillsAsync(Guid userId);
        Task<BillDto> CreateBillAsync(Guid userId, CreateUpdateBillDto dto);
        Task<BillDto> UpdateBillAsync(Guid userId, Guid billId, CreateUpdateBillDto dto);
        Task<(BillDto Bill, ExpenseDto Expense)> PayBillAsync(Guid userId, Guid billId);
        Task DeleteBillAsync(Guid userId, Guid billId);
    }
}