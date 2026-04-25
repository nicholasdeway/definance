using definance_backend.Domain.Entities;

namespace definance_backend.Features.Bills.Repositories
{
    public interface IBillRepository
    {
        Task<Bill?> GetByIdAsync(Guid id);
        Task<IEnumerable<Bill>> GetByUserIdAsync(Guid userId, int? month = null, int? year = null, DateTime? startDate = null, DateTime? endDate = null);
        Task CreateAsync(Bill bill);
        Task CreateBatchAsync(IEnumerable<Bill> bills);
        Task UpdateAsync(Bill bill);
        Task DeleteAsync(Guid id);
        Task DeleteBatchAsync(IEnumerable<Guid> ids);
    }
}