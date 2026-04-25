using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using definance_backend.Features.Bills.DTOs;
using definance_backend.Features.Bills.Services;

namespace definance_backend.Features.Bills.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class BillsController : ControllerBase
    {
        private readonly IBillService _billService;

        public BillsController(IBillService billService)
        {
            _billService = billService;
        }

        private Guid GetUserId()
        {
            var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userIdStr) || !Guid.TryParse(userIdStr, out var userId))
                throw new UnauthorizedAccessException("Usuário inválido ou não autenticado.");
            return userId;
        }

        [HttpGet]
        public async Task<IActionResult> GetBills([FromQuery] int? month, [FromQuery] int? year, [FromQuery] DateTime? startDate, [FromQuery] DateTime? endDate)
        {
            var userId = GetUserId();
            var bills = await _billService.GetUserBillsAsync(userId, month, year, startDate, endDate);
            return Ok(bills);
        }

        [HttpGet("{id:guid}")]
        public async Task<IActionResult> GetBillById(Guid id)
        {
            try
            {
                var userId = GetUserId();
                var bill = await _billService.GetBillByIdAsync(userId, id);
                return Ok(bill);
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
        public async Task<IActionResult> CreateBill([FromBody] CreateUpdateBillDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var userId = GetUserId();
            var bill = await _billService.CreateBillAsync(userId, dto);
            return CreatedAtAction(nameof(GetBillById), new { id = bill.Id }, bill);
        }

        [HttpPut("{id:guid}")]
        public async Task<IActionResult> UpdateBill(Guid id, [FromBody] CreateUpdateBillDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            try
            {
                var userId = GetUserId();
                var bill = await _billService.UpdateBillAsync(userId, id, dto);
                return Ok(bill);
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
        public async Task<IActionResult> PayBill(Guid id, [FromBody] PayBillDto dto)
        {
            try
            {
                var userId = GetUserId();
                var (bill, expense) = await _billService.PayBillAsync(userId, id, dto?.PaymentDate);
                return Ok(new { bill, expense });
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
        public async Task<IActionResult> DeleteBill(Guid id)
        {
            try
            {
                var userId = GetUserId();
                await _billService.DeleteBillAsync(userId, id);
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