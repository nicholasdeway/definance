using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using definance_backend.Features.Analysis.Services;

namespace definance_backend.Features.Analysis.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class AnalysisController : ControllerBase
    {
        private readonly IAnalysisService _analysisService;

        public AnalysisController(IAnalysisService analysisService)
        {
            _analysisService = analysisService;
        }

        private Guid GetUserId()
        {
            var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userIdStr) || !Guid.TryParse(userIdStr, out var userId))
                throw new UnauthorizedAccessException("Usuário inválido ou não autenticado.");
            return userId;
        }

        [HttpGet]
        public async Task<IActionResult> GetAnalysis(
            [FromQuery] int? month = null,
            [FromQuery] int? year = null,
            [FromQuery] DateTime? startDate = null,
            [FromQuery] DateTime? endDate = null)
        {
            try
            {
                var userId = GetUserId();
                var analysis = await _analysisService.GetAnalysisAsync(userId, month, year, startDate, endDate);
                return Ok(analysis);
            }
            catch (UnauthorizedAccessException ex)
            {
                return StatusCode(StatusCodes.Status401Unauthorized, new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, new { message = "Erro ao processar análise financeira.", details = ex.Message });
            }
        }
    }
}