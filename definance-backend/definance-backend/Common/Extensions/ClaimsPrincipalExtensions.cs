using System;
using System.Security.Claims;

namespace definance_backend.Common.Extensions
{
    public static class ClaimsPrincipalExtensions
    {
        public static Guid GetUserId(this ClaimsPrincipal user)
        {
            // Extrai o ID padronizado (compatível com JWT e Google OAuth)
            var id = user.FindFirstValue(ClaimTypes.NameIdentifier) ?? user.FindFirstValue("sub");

            if (string.IsNullOrEmpty(id) || !Guid.TryParse(id, out var userId))
                throw new UnauthorizedAccessException("ID do usuário inválido ou não encontrado no token.");

            return userId;
        }
    }
}