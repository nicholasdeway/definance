using System;
using System.Threading.Tasks;
using definance_backend.Features.Auth.DTOs;

namespace definance_backend.Features.Auth.Services
{
    public interface IAuthService
    {
        Task<string> RegisterAsync(RegisterUserDto dto);
        Task<string> LoginAsync(LoginUserDto dto);
        Task<string> RequestPasswordResetAsync(RequestPasswordResetDto dto);
        Task<string> ConfirmPasswordResetAsync(ConfirmPasswordResetDto dto);
        Task<UserProfileDto> GetUserProfileAsync(Guid userId);
    }
}