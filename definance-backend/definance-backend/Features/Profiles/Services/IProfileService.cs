using System;
using System.Threading.Tasks;
using definance_backend.Common.Helpers;
using definance_backend.Features.Auth.DTOs;
using definance_backend.Features.Profiles.DTOs;

namespace definance_backend.Features.Profiles.Services
{
    public interface IProfileService
    {
        Task<UserProfileResponse?> GetProfileAsync(Guid userId);
        Task<ServiceResult<UserProfileResponse>> UpdateProfileAsync(Guid userId, UpdateUserProfileRequest request);
        Task<ServiceResult<bool>> DeleteAccountAsync(Guid userId, DeleteAccountRequest request);
        Task<ServiceResult<bool>> ChangePasswordAsync(Guid userId, ChangePasswordDto request);
        Task<ServiceResult<string>> UpdateAvatarAsync(Guid userId, IFormFile file);
        Task<ServiceResult<bool>> RemoveAvatarAsync(Guid userId);
    }
}