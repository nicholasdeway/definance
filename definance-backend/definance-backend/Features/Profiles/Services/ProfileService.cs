using System;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using definance_backend.Common.Helpers;
using definance_backend.Features.Auth.DTOs;
using definance_backend.Features.Profiles.DTOs;
using definance_backend.Features.Profiles.Repositories;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using System.IO;
using definance_backend.Features.Subscriptions.Services;
using Microsoft.Extensions.Logging;
using System.Text.Json;
using definance_backend.Features.Onboarding.DTOs;

namespace definance_backend.Features.Profiles.Services
{
    public class ProfileService : IProfileService
    {
        private readonly IProfileRepository _userRepository;
        private readonly IWebHostEnvironment _environment;
        private readonly ISubscriptionService _subscriptionService;
        private readonly ILogger<ProfileService> _logger;

        public ProfileService(
            IProfileRepository userRepository,
            IWebHostEnvironment environment,
            ISubscriptionService subscriptionService,
            ILogger<ProfileService> logger)
        {
            _userRepository = userRepository;
            _environment = environment;
            _subscriptionService = subscriptionService;
            _logger = logger;
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
                PictureUrl = user.PictureUrl,
                CreatedAt = user.CreatedAt,
                HasCompletedOnboarding = user.HasCompletedOnboarding,
                IsWhatsAppConnected = user.IsWhatsAppConnected,
                PlanType = user.PlanType,
                PremiumUntil = user.PremiumUntil,
                IsPremium = user.IsPremium,
                StripeSubscriptionId = user.StripeSubscriptionId,
                SubscriptionStartedAt = user.SubscriptionStartedAt
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
                PictureUrl = user.PictureUrl,
                CreatedAt = user.CreatedAt,
                HasCompletedOnboarding = user.HasCompletedOnboarding,
                IsWhatsAppConnected = user.IsWhatsAppConnected,
                PlanType = user.PlanType,
                PremiumUntil = user.PremiumUntil,
                IsPremium = user.IsPremium,
                StripeSubscriptionId = user.StripeSubscriptionId,
                SubscriptionStartedAt = user.SubscriptionStartedAt
            });
        }

        public async Task<ServiceResult<bool>> DeleteAccountAsync(
            Guid userId,
            DeleteAccountRequest request)
        {
            var user = await _userRepository.GetByIdAsync(userId);

            if (user == null)
                return ServiceResult<bool>.Fail("Credenciais inválidas.");

            var isGoogleAccount =
                !string.IsNullOrWhiteSpace(user.AuthProvider) &&
                user.AuthProvider.Equals("Google", StringComparison.OrdinalIgnoreCase);

            if (!isGoogleAccount)
            {
                if (string.IsNullOrWhiteSpace(request.CurrentPassword))
                    return ServiceResult<bool>.Fail("A senha atual é obrigatória para excluir a conta.");

                if (!BCrypt.Net.BCrypt.Verify(request.CurrentPassword, user.Password))
                    return ServiceResult<bool>.Fail("Credenciais inválidas.");
            }

            if (!string.IsNullOrEmpty(user.StripeSubscriptionId))
            {
                await _subscriptionService.CancelSubscriptionAsync(user.StripeSubscriptionId);
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
                return ServiceResult<bool>.Fail("Credenciais inválidas.");

            var hashed = BCrypt.Net.BCrypt.HashPassword(request.NewPassword);
            user.Password = hashed;
            user.PasswordResetPending = false;
            user.UpdatedAt = DateTime.UtcNow;

            await _userRepository.UpdateAsync(user);

            return ServiceResult<bool>.Ok(true);
        }

        public async Task<ServiceResult<string>> UpdateAvatarAsync(Guid userId, IFormFile file)
        {
            var user = await _userRepository.GetByIdAsync(userId);
            if (user == null) return ServiceResult<string>.Fail("Usuário não encontrado.");
            if (file == null || file.Length == 0) return ServiceResult<string>.Fail("Arquivo inválido.");
            if (file.Length > 2 * 1024 * 1024) return ServiceResult<string>.Fail("Imagem muito grande (máx 2MB).");

            var ext = Path.GetExtension(file.FileName).ToLowerInvariant();
            if (string.IsNullOrEmpty(ext)) ext = ".jpg"; 

            var fileName = $"{userId}_{DateTime.UtcNow.Ticks}{ext}";
            var uploadsPath = Path.Combine(_environment.WebRootPath, "uploads", "avatars");
            if (!Directory.Exists(uploadsPath)) Directory.CreateDirectory(uploadsPath);
            
            var filePath = Path.Combine(uploadsPath, fileName);
            using (var stream = new FileStream(filePath, FileMode.Create)) { await file.CopyToAsync(stream); }

            user.PictureUrl = $"/uploads/avatars/{fileName}";
            user.UpdatedAt = DateTime.UtcNow;
            await _userRepository.UpdateAsync(user);
            return ServiceResult<string>.Ok(user.PictureUrl);
        }

        public async Task<ServiceResult<bool>> RemoveAvatarAsync(Guid userId)
        {
            var user = await _userRepository.GetByIdAsync(userId);
            if (user == null) return ServiceResult<bool>.Fail("Usuário não encontrado.");
            user.PictureUrl = null;
            user.UpdatedAt = DateTime.UtcNow;
            await _userRepository.UpdateAsync(user);
            return ServiceResult<bool>.Ok(true);
        }

        public async Task<ServiceResult<bool>> PurgeDataAsync(Guid userId, string dataType)
        {
            var allowedTypes = new[] { "incomes", "expenses", "history", "daily-expenses", "bills", "goals", "categories" };
            if (Array.IndexOf(allowedTypes, dataType) < 0)
            {
                _logger.LogWarning("Tentativa de limpeza com tipo de dado inválido '{DataType}' pelo usuário '{UserId}'", dataType, userId);
                return ServiceResult<bool>.Fail("Tipo de dado inválido para exclusão.");
            }

            try
            {
                _logger.LogWarning("Iniciando exclusão de dados do tipo '{DataType}' para o usuário '{UserId}'", dataType, userId);
                await _userRepository.PurgeDataAsync(userId, dataType);

                // Sincronizar a exclusão de dados no OnboardingData para refletir no Perfil Financeiro
                var user = await _userRepository.GetByIdAsync(userId);
                if (user != null && !string.IsNullOrEmpty(user.OnboardingData))
                {
                    var options = new JsonSerializerOptions 
                    { 
                        PropertyNameCaseInsensitive = true,
                        PropertyNamingPolicy = JsonNamingPolicy.CamelCase 
                    };

                    var onboardingDto = JsonSerializer.Deserialize<OnboardingSubmissionDto>(user.OnboardingData, options);
                    if (onboardingDto != null)
                    {
                        bool updated = false;
                        if (dataType == "bills")
                        {
                            onboardingDto.SelectedExpenses = new();
                            onboardingDto.CustomExpenses = new();
                            onboardingDto.BillLoans = new();
                            onboardingDto.Vehicles = new();
                            onboardingDto.Debts = new();
                            updated = true;
                        }
                        else if (dataType == "incomes" || dataType == "history")
                        {
                            onboardingDto.Incomes = new();
                            onboardingDto.SelectedIncomeTypes = new();
                            updated = true;
                        }

                        if (updated)
                        {
                            user.OnboardingData = JsonSerializer.Serialize(onboardingDto, options);
                            user.UpdatedAt = DateTime.UtcNow;
                            await _userRepository.UpdateAsync(user);
                            _logger.LogInformation("OnboardingData atualizado com sucesso após a exclusão do tipo '{DataType}' para o usuário '{UserId}'", dataType, userId);
                        }
                    }
                }

                _logger.LogInformation("Dados do tipo '{DataType}' excluídos com sucesso para o usuário '{UserId}'", dataType, userId);
                return ServiceResult<bool>.Ok(true);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erro ao excluir dados do tipo '{DataType}' para o usuário '{UserId}'", dataType, userId);
                return ServiceResult<bool>.Fail("Ocorreu um erro ao processar a exclusão dos dados.");
            }
        }
    }
}