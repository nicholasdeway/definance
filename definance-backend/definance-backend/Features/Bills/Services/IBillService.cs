using definance_backend.Features.Bills.DTOs;
using definance_backend.Features.Bills.Repositories;
using definance_backend.Features.Expenses.DTOs;

namespace definance_backend.Features.Bills.Services
{
    public interface IBillService
    {
        Task<BillDto> GetBillByIdAsync(Guid userId, Guid billId);
        Task<IEnumerable<BillDto>> GetUserBillsAsync(Guid userId, int? month = null, int? year = null, DateTime? startDate = null, DateTime? endDate = null);
        Task<BillDto> CreateBillAsync(Guid userId, CreateUpdateBillDto dto);
        Task<BillDto> UpdateBillAsync(Guid userId, Guid billId, CreateUpdateBillDto dto);
        Task<(BillDto Bill, ExpenseDto Expense)> PayBillAsync(Guid userId, Guid billId, DateTime? paymentDate = null);
        Task DeleteBillAsync(Guid userId, Guid billId);
    }
}