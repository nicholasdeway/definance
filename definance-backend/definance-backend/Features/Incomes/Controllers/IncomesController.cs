using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using definance_backend.Features.Incomes.DTOs;
using definance_backend.Features.Incomes.Services;

namespace definance_backend.Features.Incomes.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class IncomesController : ControllerBase
    {
        private readonly IIncomeService _incomeService;

        public IncomesController(IIncomeService incomeService)
        {
            _incomeService = incomeService;
        }

        private Guid GetUserId()
        {
            var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userIdStr) || !Guid.TryParse(userIdStr, out var userId))
                throw new UnauthorizedAccessException("Usuário inválido ou não autenticado.");
            return userId;
        }

        [HttpGet]
        public async Task<IActionResult> GetIncomes()
        {
            var userId = GetUserId();
            var incomes = await _incomeService.GetUserIncomesAsync(userId);
            return Ok(incomes);
        }

        [HttpGet("{id:guid}")]
        public async Task<IActionResult> GetIncomeById(Guid id)
        {
            try
            {
                var userId = GetUserId();
                var income = await _incomeService.GetIncomeByIdAsync(userId, id);
                return Ok(income);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (UnauthorizedAccessException ex)
            {
                return StatusCode(StatusCodes.Status403Forbidden, new { message = ex.Message });
            }
        }

        [HttpPost]
        public async Task<IActionResult> CreateIncome([FromBody] CreateUpdateIncomeDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var userId = GetUserId();
            var income = await _incomeService.CreateIncomeAsync(userId, dto);
            return CreatedAtAction(nameof(GetIncomeById), new { id = income.Id }, income);
        }

        [HttpPut("{id:guid}")]
        public async Task<IActionResult> UpdateIncome(Guid id, [FromBody] CreateUpdateIncomeDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            try
            {
                var userId = GetUserId();
                var income = await _incomeService.UpdateIncomeAsync(userId, id, dto);
                return Ok(income);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (UnauthorizedAccessException ex)
            {
                return StatusCode(StatusCodes.Status403Forbidden, new { message = ex.Message });
            }
        }

        [HttpDelete("{id:guid}")]
        public async Task<IActionResult> DeleteIncome(Guid id)
        {
            try
            {
                var userId = GetUserId();
                await _incomeService.DeleteIncomeAsync(userId, id);
                return NoContent();
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (UnauthorizedAccessException ex)
            {
                return StatusCode(StatusCodes.Status403Forbidden, new { message = ex.Message });
            }
        }
    }
}