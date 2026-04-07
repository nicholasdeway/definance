using System;
using System.Threading.Tasks;
using definance_backend.Domain.Entities;

namespace definance_backend.Features.Auth.Repositories
{
    public interface IUserRepository
    {
        Task<User?> GetByIdAsync(Guid id);
        Task<User?> GetByEmailAsync(string email);
        Task<User?> GetByPhoneAsync(string phone);
        Task<User> CreateAsync(User user);
        Task UpdatePasswordAsync(User user);
        Task<User> UpdateAsync(User user);
        Task MarkResetPendingAsync(Guid id);
    }
}