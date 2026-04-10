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
    }
}