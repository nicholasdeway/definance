using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using definance_backend.Features.Expenses.DTOs;
using definance_backend.Features.Expenses.Services;

namespace definance_backend.Features.Expenses.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class ExpensesController : ControllerBase
    {
        private readonly IExpenseService _expenseService;

        public ExpensesController(IExpenseService expenseService)
        {
            _expenseService = expenseService;
        }

        private Guid GetUserId()
        {
            var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userIdStr) || !Guid.TryParse(userIdStr, out var userId))
                throw new UnauthorizedAccessException("Usuário inválido ou não autenticado.");
            return userId;
        }

        [HttpGet]
        public async Task<IActionResult> GetExpenses([FromQuery] int? month, [FromQuery] int? year)
        {
            var userId = GetUserId();
            var expenses = await _expenseService.GetUserExpensesAsync(userId, month, year);
            return Ok(expenses);
        }

        [HttpGet("{id:guid}")]
        public async Task<IActionResult> GetExpenseById(Guid id)
        {
            try
            {
                var userId = GetUserId();
                var expense = await _expenseService.GetExpenseByIdAsync(userId, id);
                return Ok(expense);
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
        public async Task<IActionResult> CreateExpense([FromBody] CreateUpdateExpenseDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var userId = GetUserId();
            var expense = await _expenseService.CreateExpenseAsync(userId, dto);
            return CreatedAtAction(nameof(GetExpenseById), new { id = expense.Id }, expense);
        }

        [HttpPut("{id:guid}")]
        public async Task<IActionResult> UpdateExpense(Guid id, [FromBody] CreateUpdateExpenseDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            try
            {
                var userId = GetUserId();
                var expense = await _expenseService.UpdateExpenseAsync(userId, id, dto);
                return Ok(expense);
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

        [HttpPut("{id:guid}/pay")]
        public async Task<IActionResult> MarkAsPaid(Guid id)
        {
            try
            {
                var userId = GetUserId();
                var expense = await _expenseService.MarkAsPaidAsync(userId, id);
                return Ok(expense);
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
        public async Task<IActionResult> DeleteExpense(Guid id)
        {
            try
            {
                var userId = GetUserId();
                await _expenseService.DeleteExpenseAsync(userId, id);
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
