using System;
using System.Threading.Tasks;
using definance_backend.Features.Onboarding.DTOs;
using definance_backend.Domain.Entities;

namespace definance_backend.Features.Onboarding.Services
{
    public interface IOnboardingService
    {
        Task CompleteOnboardingAsync(Guid userId, OnboardingSubmissionDto dto);
        Task SaveStepProgressAsync(Guid userId, int stepNumber, System.Text.Json.JsonElement data);
        Task SyncVehiclesAsync(Guid userId);
        Task SyncIncomesAsync(Guid userId);
        Task SyncFixedExpensesAsync(Guid userId);
        Task SyncDebtsAsync(Guid userId);
        Task SyncDeleteBillWithProfileAsync(Guid userId, definance_backend.Domain.Entities.Bill bill);
        Task<OnboardingSubmissionDto?> GetProgressAsync(Guid userId);
    }
}