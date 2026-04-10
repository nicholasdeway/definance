using System;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using definance_backend.Common.Helpers;
using definance_backend.Features.Auth.DTOs;
using definance_backend.Features.Profiles.DTOs;
using definance_backend.Features.Profiles.Repositories;

namespace definance_backend.Features.Profiles.Services
{
    public class ProfileService : IProfileService
    {
        private readonly IProfileRepository _userRepository;

        public ProfileService(IProfileRepository userRepository)
        {
            _userRepository = userRepository;
        }

        public async Task<UserProfileResponse?> GetProfileAsync(Guid userId)
        {
            var user = await _userRepository.GetByIdAsync(userId);

            if (user == null)
                return null;

            if (!user.IsActive)
                return null;

            return new UserProfileResponse
            {
                Id = user.Id.ToString(),
                FirstName = user.FirstName,
                LastName = user.LastName,
                Email = user.Email,
                Phone = user.Phone,
                CreatedAt = user.CreatedAt,
                HasCompletedOnboarding = user.HasCompletedOnboarding
            };
        }


        public async Task<ServiceResult<UserProfileResponse>> UpdateProfileAsync(
            Guid userId,
            UpdateUserProfileRequest request)
        {
            var user = await _userRepository.GetByIdAsync(userId);

            if (user == null)
                return ServiceResult<UserProfileResponse>.Fail("Usuário não encontrado.");

            user.FirstName = NameFormatter.NormalizeName(request.FirstName);
            user.LastName = NameFormatter.NormalizeName(request.LastName);

            if (string.IsNullOrWhiteSpace(request.Phone))
            {
                user.Phone = null;
            }
            else
            {
                var digits = Regex.Replace(request.Phone, @"\D", "");
                
                var existingUser = await _userRepository.GetByPhoneAsync(digits);
                if (existingUser != null && existingUser.Id != userId)
                {
                    return ServiceResult<UserProfileResponse>.Fail("Já existe uma conta cadastrada com este número de celular.");
                }
                
                user.Phone = digits;
            }

            user.UpdatedAt = DateTime.UtcNow;

            await _userRepository.UpdateAsync(user);

            return ServiceResult<UserProfileResponse>.Ok(new UserProfileResponse
            {
                Id = user.Id.ToString(),
                FirstName = user.FirstName,
                LastName = user.LastName,
                Email = user.Email,
                Phone = user.Phone,
                CreatedAt = user.CreatedAt,
                HasCompletedOnboarding = user.HasCompletedOnboarding
            });
        }

        public async Task<ServiceResult<bool>> DeleteAccountAsync(
            Guid userId,
            DeleteAccountRequest request)
        {
            var user = await _userRepository.GetByIdAsync(userId);

            if (user == null)
                return ServiceResult<bool>.Fail("Credenciais inválidas ou usuário não encontrado.");

            var isGoogleAccount =
                !string.IsNullOrWhiteSpace(user.AuthProvider) &&
                user.AuthProvider.Equals("Google", StringComparison.OrdinalIgnoreCase);

            if (!isGoogleAccount)
            {
                if (string.IsNullOrWhiteSpace(request.CurrentPassword))
                    return ServiceResult<bool>.Fail("A senha atual é obrigatória para excluir a conta.");

                if (!BCrypt.Net.BCrypt.Verify(request.CurrentPassword, user.Password))
                    return ServiceResult<bool>.Fail("Credenciais inválidas ou usuário não encontrado.");
            }

            await _userRepository.SoftDeleteAsync(userId);

            return ServiceResult<bool>.Ok(true);
        }

        public async Task<ServiceResult<bool>> ChangePasswordAsync(
            Guid userId,
            ChangePasswordDto request)
        {
            if (string.IsNullOrWhiteSpace(request.CurrentPassword) ||
                string.IsNullOrWhiteSpace(request.NewPassword) ||
                string.IsNullOrWhiteSpace(request.ConfirmNewPassword))
            {
                return ServiceResult<bool>.Fail("Preencha todos os campos de senha.");
            }

            if (request.NewPassword != request.ConfirmNewPassword)
                return ServiceResult<bool>.Fail("Nova senha e confirmação não conferem.");

            if (request.NewPassword.Length < 8)
                return ServiceResult<bool>.Fail("A nova senha deve ter no mínimo 8 caracteres.");

            var user = await _userRepository.GetByIdAsync(userId);
            if (user == null)
                return ServiceResult<bool>.Fail("Usuário não encontrado.");

            if (!string.IsNullOrWhiteSpace(user.AuthProvider) &&
                user.AuthProvider.Equals("Google", StringComparison.OrdinalIgnoreCase))
            {
                return ServiceResult<bool>.Fail(
                    "Sua conta está conectada ao Google. A senha não é gerenciada pelo Google e não pode ser alterada aqui."
                );
            }

            var isValid = BCrypt.Net.BCrypt.Verify(request.CurrentPassword, user.Password);
            if (!isValid)
                return ServiceResult<bool>.Fail("Credenciais inválidas ou usuário não encontrado.");

            var hashed = BCrypt.Net.BCrypt.HashPassword(request.NewPassword);
            user.Password = hashed;
            user.PasswordResetPending = false;
            user.UpdatedAt = DateTime.UtcNow;

            await _userRepository.UpdateAsync(user);

            return ServiceResult<bool>.Ok(true);
        }
    }
}