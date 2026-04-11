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
    }
}