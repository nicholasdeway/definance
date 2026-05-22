using System;

namespace definance_backend.Features.Auth.DTOs
{
    public class UserProfileDto
    {
        public Guid Id { get; set; }
        public string Email { get; set; } = string.Empty;
        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        public string? Phone { get; set; }
        public string? PictureUrl { get; set; }
        public string AuthProvider { get; set; } = "Local";
        public bool HasCompletedOnboarding { get; set; }
        public bool IsWhatsAppConnected { get; set; }
        public DateTime CreatedAt { get; set; }
        public string PlanType { get; set; } = "Free";
        public DateTime? PremiumUntil { get; set; }
        public bool IsPremium { get; set; }
        public DateTime? SubscriptionStartedAt { get; set; }
        public bool IsEligibleForRefund { get; set; }
        public string? StripeSubscriptionId { get; set; }
    }
}