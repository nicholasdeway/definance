using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using definance_backend.Features.DailyExpenses.DTOs;
using definance_backend.Features.DailyExpenses.Services;

using Microsoft.AspNetCore.RateLimiting;

namespace definance_backend.Features.DailyExpenses.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    [EnableRateLimiting("ai-limit")]
    public class DailyExpensesController : ControllerBase
    {
        private readonly IDailyExpenseService _dailyExpenseService;

        public DailyExpensesController(IDailyExpenseService dailyExpenseService)
        {
            _dailyExpenseService = dailyExpenseService;
        }

        private Guid GetUserId()
        {
            var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userIdStr) || !Guid.TryParse(userIdStr, out var userId))
                throw new UnauthorizedAccessException("Usuário inválido ou não autenticado.");
            return userId;
        }

        [HttpPost("quick")]
        public async Task<IActionResult> CreateQuickExpense([FromBody] QuickExpenseRequestDto dto)
        {
            try
            {
                var userId = GetUserId();
                var result = await _dailyExpenseService.CreateQuickExpenseAsync(userId, dto);
                return Ok(result);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, new { message = "Erro ao processar lançamento rápido.", details = ex.Message });
            }
        }
    }
}