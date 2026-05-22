using System;
using System.Security.Claims;
using System.Threading.Tasks;
using definance_backend.Features.Auth.Repositories;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.Extensions.DependencyInjection;

namespace definance_backend.Common.Filters
{
    [AttributeUsage(AttributeTargets.Class | AttributeTargets.Method)]
    public class PremiumRequiredAttribute : Attribute, IAsyncActionFilter
    {
        public async Task OnActionExecutionAsync(ActionExecutingContext context, ActionExecutionDelegate next)
        {
            var userPrincipal = context.HttpContext.User;
            var userIdStr = userPrincipal.FindFirstValue(ClaimTypes.NameIdentifier);

            if (string.IsNullOrEmpty(userIdStr) || !Guid.TryParse(userIdStr, out var userId))
            {
                context.Result = new UnauthorizedObjectResult(new { message = "Usuário não autenticado." });
                return;
            }

            var userRepository = context.HttpContext.RequestServices.GetRequiredService<IUserRepository>();
            var user = await userRepository.GetByIdAsync(userId);

            // GetByIdAsync já filtra is_active = TRUE, então user == null cobre tanto
            // "usuário não existe" quanto "usuário inativo".
            if (user == null)
            {
                context.Result = new UnauthorizedObjectResult(new { message = "Usuário não autenticado." });
                return;
            }

            if (!user.IsPremium)
            {
                context.Result = new ObjectResult(new { message = "Assinatura Premium necessária." })
                {
                    StatusCode = 402
                };
                return;
            }

            await next();
        }
    }
}