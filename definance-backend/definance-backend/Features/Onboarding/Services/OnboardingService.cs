using System;
using System.Text.Json;
using System.Threading.Tasks;
using definance_backend.Features.Auth.Repositories;
using definance_backend.Features.Onboarding.DTOs;

namespace definance_backend.Features.Onboarding.Services
{
    public class OnboardingService : IOnboardingService
    {
        private readonly IUserRepository _userRepository;

        public OnboardingService(IUserRepository userRepository)
        {
            _userRepository = userRepository;
        }

        public async Task CompleteOnboardingAsync(Guid userId, OnboardingSubmissionDto dto)
        {
            if (dto.SelectedIncomeTypes == null || dto.SelectedIncomeTypes.Count == 0)
            {
                throw new ApplicationException("Selecione pelo menos uma fonte de renda para prosseguir.");
            }

            var user = await _userRepository.GetByIdAsync(userId);
            if (user == null)
            {
                throw new ApplicationException("Usuário não encontrado.");
            }

            var options = new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.CamelCase };
            var jsonData = JsonSerializer.Serialize(dto, options);

            user.HasCompletedOnboarding = true;
            user.OnboardingData = jsonData;
            user.UpdatedAt = DateTime.UtcNow;

            await _userRepository.UpdateAsync(user);
        }

        public async Task SaveStepProgressAsync(Guid userId, int stepNumber, System.Text.Json.JsonElement data)
        {
            var user = await _userRepository.GetByIdAsync(userId);
            if (user == null)
            {
                throw new ApplicationException("Usuário não encontrado.");
            }

            var currentData = string.IsNullOrEmpty(user.OnboardingData)
                ? new OnboardingSubmissionDto()
                : JsonSerializer.Deserialize<OnboardingSubmissionDto>(user.OnboardingData, new JsonSerializerOptions { PropertyNameCaseInsensitive = true }) 
                  ?? new OnboardingSubmissionDto();

            currentData.CurrentStep = stepNumber;
            var jsonData = data.GetRawText();
            
            var options = new JsonSerializerOptions 
            { 
                PropertyNameCaseInsensitive = true,
                PropertyNamingPolicy = JsonNamingPolicy.CamelCase 
            };
            
            switch (stepNumber)
            {
                case 1:
                    currentData.Motivations = JsonSerializer.Deserialize<List<string>>(jsonData, options) ?? new();
                    break;
                case 2:
                    currentData.SelectedIncomeTypes = JsonSerializer.Deserialize<List<string>>(jsonData, options) ?? new();
                    break;
                case 3:
                    currentData.Incomes = JsonSerializer.Deserialize<List<IncomeDetailDto>>(jsonData, options) ?? new();
                    break;
                case 4:
                    var step4Data = JsonSerializer.Deserialize<OnboardingSubmissionDto>(jsonData, options);
                    if (step4Data != null)
                    {
                        currentData.SelectedExpenses = step4Data.SelectedExpenses;
                        currentData.CustomExpenses = step4Data.CustomExpenses;
                        currentData.BillLoans = step4Data.BillLoans;
                    }
                    break;
                case 5:
                    currentData.Vehicles = JsonSerializer.Deserialize<List<VehicleDto>>(jsonData, options) ?? new();
                    break;
                case 6:
                    currentData.Debts = JsonSerializer.Deserialize<List<DebtDto>>(jsonData, options) ?? new();
                    break;
            }

            user.OnboardingData = JsonSerializer.Serialize(currentData, options);
            user.UpdatedAt = DateTime.UtcNow;

            await _userRepository.UpdateAsync(user);
        }

        public async Task<OnboardingSubmissionDto?> GetProgressAsync(Guid userId)
        {
            var user = await _userRepository.GetByIdAsync(userId);
            if (user == null || string.IsNullOrEmpty(user.OnboardingData))
            {
                return null;
            }

            var options = new JsonSerializerOptions 
            { 
                PropertyNameCaseInsensitive = true,
                PropertyNamingPolicy = JsonNamingPolicy.CamelCase 
            };

            return JsonSerializer.Deserialize<OnboardingSubmissionDto>(user.OnboardingData, options);
        }
    }
}