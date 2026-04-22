using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using definance_backend.Features.Goals.DTOs;
using definance_backend.Features.Goals.Services;

namespace definance_backend.Features.Goals.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class GoalsController : ControllerBase
    {
        private readonly IGoalService _goalService;

        public GoalsController(IGoalService goalService)
        {
            _goalService = goalService;
        }

        private Guid GetUserId()
        {
            var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userIdStr) || !Guid.TryParse(userIdStr, out var userId))
                throw new UnauthorizedAccessException("Usuário inválido ou não autenticado.");
            return userId;
        }

        [HttpGet]
        public async Task<IActionResult> GetGoals()
        {
            var userId = GetUserId();
            var goals = await _goalService.GetUserGoalsAsync(userId);
            return Ok(goals);
        }

        [HttpGet("{id:guid}")]
        public async Task<IActionResult> GetGoalById(Guid id)
        {
            try
            {
                var userId = GetUserId();
                var goal = await _goalService.GetGoalByIdAsync(userId, id);
                return Ok(goal);
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
        public async Task<IActionResult> CreateGoal([FromBody] CreateUpdateGoalDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var userId = GetUserId();
            var goal = await _goalService.CreateGoalAsync(userId, dto);
            return CreatedAtAction(nameof(GetGoalById), new { id = goal.Id }, goal);
        }

        [HttpPut("{id:guid}")]
        public async Task<IActionResult> UpdateGoal(Guid id, [FromBody] CreateUpdateGoalDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            try
            {
                var userId = GetUserId();
                var goal = await _goalService.UpdateGoalAsync(userId, id, dto);
                return Ok(goal);
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

        [HttpPatch("{id:guid}/deposit")]
        public async Task<IActionResult> Deposit(Guid id, [FromBody] DepositGoalDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            try
            {
                var userId = GetUserId();
                var goal = await _goalService.DepositAsync(userId, id, dto);
                return Ok(goal);
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
        public async Task<IActionResult> DeleteGoal(Guid id)
        {
            try
            {
                var userId = GetUserId();
                await _goalService.DeleteGoalAsync(userId, id);
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