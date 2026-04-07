using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using definance_backend.Features.Profiles.DTOs;
using definance_backend.Features.Auth.DTOs;
using definance_backend.Features.Profiles.Services;
using definance_backend.Common.Extensions;

namespace definance_backend.Features.Profiles.Controllers
{
    [ApiController]
    [Route("api/profile")]
    [Authorize]
    public class ProfileController : ControllerBase
    {
        private readonly IProfileService _profileService;
        private readonly ILogger<ProfileController> _logger;

        public ProfileController(IProfileService profileService, ILogger<ProfileController> logger)
        {
            _profileService = profileService;
            _logger = logger;
        }

        [HttpGet]
        public async Task<ActionResult<UserProfileResponse>> GetProfile()
        {
            var userId = User.GetUserId();

            var profile = await _profileService.GetProfileAsync(userId);

            if (profile == null)
                return NotFound();

            return Ok(profile);
        }


        [HttpPut]
        public async Task<IActionResult> UpdateProfile(
            [FromBody] UpdateUserProfileRequest request)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var userId = User.GetUserId();

            var result = await _profileService.UpdateProfileAsync(userId, request);

            if (!result.Success)
                return BadRequest(result.Errors);

            return Ok(result.Data);
        }


        [HttpPut("password")]
        public async Task<IActionResult> ChangePassword(
            [FromBody] ChangePasswordDto request)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var userId = User.GetUserId();

            var result = await _profileService.ChangePasswordAsync(userId, request);

            if (!result.Success)
            {
                _logger.LogWarning("Tentativa de troca de senha falhou para o usuário {UserId}", userId);
                return BadRequest(result.Errors);
            }

            _logger.LogInformation("Senha alterada com sucesso para o usuário {UserId}", userId);
            return Ok(new { message = "Senha alterada com sucesso." });
        }


        [HttpDelete]
        public async Task<IActionResult> DeleteAccount(
            [FromBody] DeleteAccountRequest request)
        {
            var userId = User.GetUserId();

            _logger.LogWarning("Usuário {UserId} solicitou exclusão de conta", userId);

            var result = await _profileService.DeleteAccountAsync(userId, request);

            if (!result.Success)
            {
                _logger.LogWarning("Tentativa de exclusão de conta falhou para o usuário {UserId}", userId);
                return BadRequest(result.Errors);
            }

            _logger.LogInformation("Conta {UserId} excluída com sucesso", userId);
            return Ok(new { message = "Conta excluída com sucesso." });
        }
    }
}