using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace definance_backend.Common
{
    [ApiController]
    [Route("api/[controller]")]
    public abstract class BaseApiController : ControllerBase
    {
        protected Guid GetUserId()
        {
            var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userIdStr) || !Guid.TryParse(userIdStr, out var userId))
                throw new UnauthorizedAccessException("Usuário inválido ou não autenticado.");
            return userId;
        }
    }
}
