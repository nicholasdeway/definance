using System;
using System.Security.Claims;
using System.Threading.Tasks;
using definance_backend.Features.Onboarding.DTOs;
using definance_backend.Features.Onboarding.Services;
using definance_backend.Common.Extensions;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace definance_backend.Features.Onboarding.Controllers
{
    [ApiController]
    [Route("api/onboarding")]
    [Authorize]
    public class OnboardingController : ControllerBase
    {
        private readonly IOnboardingService _onboardingService;

        public OnboardingController(IOnboardingService onboardingService)
        {
            _onboardingService = onboardingService;
        }

        [HttpPost("complete")]
        public async Task<IActionResult> CompleteOnboarding([FromBody] OnboardingSubmissionDto dto)
        {
            try
            {
                var userId = User.GetUserId();
                await _onboardingService.CompleteOnboardingAsync(userId, dto);
                return Ok(new { message = "Onboarding finalizado com sucesso!" });
            }
            catch (UnauthorizedAccessException ex)
            {
                return Unauthorized(new { message = ex.Message });
            }
            catch (ApplicationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception)
            {
                return StatusCode(500, new { message = "Ocorreu um erro interno ao processar o onboarding." });
            }
        }

        [HttpPost("save-step/{stepNumber}")]
        public async Task<IActionResult> SaveStep(int stepNumber, [FromBody] System.Text.Json.JsonElement data)
        {
            try
            {
                var userId = User.GetUserId();
                await _onboardingService.SaveStepProgressAsync(userId, stepNumber, data);
                return Ok(new { message = $"Progresso da etapa {stepNumber} salvo." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }

        [HttpPost("sync-incomes")]
        public async Task<IActionResult> SyncIncomes()
        {
            try
            {
                var userId = User.GetUserId();
                await _onboardingService.SyncIncomesAsync(userId);
                return Ok(new { message = "Receitas sincronizadas com sucesso." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }

        [HttpPost("sync-vehicles")]
        public async Task<IActionResult> SyncVehicles()
        {
            try
            {
                var userId = User.GetUserId();
                await _onboardingService.SyncVehiclesAsync(userId);
                return Ok(new { message = "Veículos sincronizados com sucesso." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }

        [HttpPost("sync-fixed-expenses")]
        public async Task<IActionResult> SyncFixedExpenses()
        {
            try
            {
                var userId = User.GetUserId();
                await _onboardingService.SyncFixedExpensesAsync(userId);
                return Ok(new { message = "Gastos fixos sincronizados com sucesso." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }

        [HttpPost("sync-debts")]
        public async Task<IActionResult> SyncDebts()
        {
            try
            {
                var userId = User.GetUserId();
                await _onboardingService.SyncDebtsAsync(userId);
                return Ok(new { message = "Dívidas sincronizadas com sucesso." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }

        [HttpGet("progress")]
        public async Task<IActionResult> GetProgress()
        {
            try
            {
                var userId = User.GetUserId();
                var progress = await _onboardingService.GetProgressAsync(userId);
                if (progress == null) return Ok(new OnboardingSubmissionDto());
                return Ok(progress);
            }
            catch (Exception)
            {
                return StatusCode(500, new { message = "Erro ao recuperar progresso." });
            }
        }
    }
}