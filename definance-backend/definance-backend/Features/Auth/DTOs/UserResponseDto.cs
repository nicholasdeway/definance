namespace definance_backend.Features.Auth.DTOs
{
    public class UserResponseDto
    {
        public string Id { get; set; } = null!;
        public string FirstName { get; set; } = null!;
        public string LastName { get; set; } = null!;
        public string Email { get; set; } = null!;
        public string? PictureUrl { get; set; }
        public string Message { get; set; } = null!;
    }
}