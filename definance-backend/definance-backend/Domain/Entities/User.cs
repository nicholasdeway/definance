namespace definance_backend.Domain.Entities
{
    public class User
    {
        public Guid Id { get; set; } = Guid.NewGuid();

        public string FirstName { get; set; } = null!;
        public string LastName { get; set; } = null!;
        public string Email { get; set; } = null!;

        public string Password { get; set; } = null!;

        public string? Phone { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; set; }

        public bool PasswordResetPending { get; set; }
        public string? PasswordResetToken { get; set; }
        public DateTime? PasswordResetExpiresAt { get; set; }

        public DateTime? LastLoginAt { get; set; }

        public string AuthProvider { get; set; } = "Local";

        public string? ProviderUserId { get; set; }
        public string? ProviderEmail { get; set; }
        public string? PictureUrl { get; set; }

        public int FailedLoginAttempts { get; set; } = 0;
        public DateTime? LockoutEnd { get; set; }

        public bool IsActive { get; set; } = true;
    }
}