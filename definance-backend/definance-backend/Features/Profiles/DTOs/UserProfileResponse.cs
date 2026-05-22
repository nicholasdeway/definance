namespace definance_backend.Features.Profiles.DTOs
{
    public class UserProfileResponse
    {
        public string Id { get; set; } = string.Empty;
        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string? Phone { get; set; }
        public string? PictureUrl { get; set; }
        public DateTime CreatedAt { get; set; }
        public bool HasCompletedOnboarding { get; set; }
        public bool IsWhatsAppConnected { get; set; }
        public string PlanType { get; set; } = string.Empty;
        public DateTime? PremiumUntil { get; set; }
        public bool IsPremium { get; set; }
        public string? StripeSubscriptionId { get; set; }
        public DateTime? SubscriptionStartedAt { get; set; }
    }
}