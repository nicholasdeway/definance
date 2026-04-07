using System.Security.Claims;
using definance_backend.Domain.Entities;

namespace definance_backend.Features.Auth.Services
{
    public interface IJwtService
    {
        string GenerateToken(User user);
        ClaimsPrincipal? ValidateToken(string token);
    }
}