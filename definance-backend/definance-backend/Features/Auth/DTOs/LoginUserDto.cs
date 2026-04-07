namespace definance_backend.Features.Auth.DTOs
{
    public class LoginUserDto
    {
        public string Identifier { get; set; } = null!;
        public string Password { get; set; } = null!;
    }
}