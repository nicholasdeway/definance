using definance_backend.Domain.Entities;

namespace definance_backend.Features.Profiles.Repositories
{
    public interface IProfileRepository
    {
        Task<User?> GetByIdAsync(Guid userId);
        Task<User?> GetByEmailAsync(string email);
        Task<User?> GetByPhoneAsync(string phone);
        Task UpdateAsync(User user);
        Task SoftDeleteAsync(Guid userId);
    }
}