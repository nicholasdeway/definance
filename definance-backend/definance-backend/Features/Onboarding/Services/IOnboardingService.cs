using System;
using System.Threading.Tasks;
using definance_backend.Features.Onboarding.DTOs;

namespace definance_backend.Features.Onboarding.Services
{
    public interface IOnboardingService
    {
        Task CompleteOnboardingAsync(Guid userId, OnboardingSubmissionDto dto);
        Task SaveStepProgressAsync(Guid userId, int stepNumber, System.Text.Json.JsonElement data);
        Task SyncVehiclesAsync(Guid userId);
        Task<OnboardingSubmissionDto?> GetProgressAsync(Guid userId);
    }
}