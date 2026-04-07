using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using definance_backend.Features.Auth.Services;
using definance_backend.Features.Auth.DTOs;
using definance_backend.Common.Extensions;
using Microsoft.AspNetCore.RateLimiting;

namespace definance_backend.Features.Auth.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _AuthService;
        private readonly ILogger<AuthController> _logger;
        private readonly IConfiguration _configuration;
        private readonly IWebHostEnvironment _env;

        public AuthController(IAuthService authService, ILogger<AuthController> logger, IConfiguration configuration, IWebHostEnvironment env)
        {
            _AuthService = authService;
            _logger = logger;
            _configuration = configuration;
            _env = env;
        }

        private const string GenericErrorMessage = "Erro interno no servidor.";
        private const string TokenCookieName = "definance_token";

        private void SetTokenCookie(string token)
        {
            var expiresMinutesStr = _configuration["Jwt:ExpiresInMinutes"] ?? "480";
            if (!double.TryParse(expiresMinutesStr, out var expiresMinutes))
                expiresMinutes = 480;

            var cookieOptions = new CookieOptions
            {
                HttpOnly = true,
                Secure = !_env.IsDevelopment(),
                SameSite = _env.IsDevelopment() ? SameSiteMode.Lax : SameSiteMode.None,
                Expires = DateTime.UtcNow.AddMinutes(expiresMinutes),
                IsEssential = true
            };
            Response.Cookies.Append(TokenCookieName, token, cookieOptions);
        }

        [HttpPost("register")]
        [EnableRateLimiting("AuthPolicy")]
        public async Task<IActionResult> Register([FromBody] RegisterUserDto dto)
        {
            if (!ModelState.IsValid)
            {
                _logger.LogWarning("ModelState inválido no registro de usuário. Erros: {@ModelStateErrors}", ModelState);
                return BadRequest(ModelState);
            }

            try
            {
                var token = await _AuthService.RegisterAsync(dto);

                _logger.LogInformation(
                    "Usuário registrado com sucesso. Email registrado: {Email}",
                    dto.Email
                );

                SetTokenCookie(token);
                return Ok(new 
                { 
                    message = "Registration successful",
                    token = token 
                });
            }
            catch (ApplicationException ex)
            {
                _logger.LogWarning(ex,
                    "Erro de negócio ao registrar usuário. Email: {Email}. Mensagem: {Message}",
                    dto.Email,
                    ex.Message);

                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex,
                    "Erro inesperado ao registrar usuário. Email: {Email}",
                    dto.Email);

                return StatusCode(500, new { message = GenericErrorMessage, traceId = HttpContext.TraceIdentifier });
            }
        }

        [HttpPost("login")]
        [EnableRateLimiting("AuthPolicy")]
        public async Task<IActionResult> Login([FromBody] LoginUserDto dto)
        {
            if (!ModelState.IsValid)
            {
                _logger.LogWarning("ModelState inválido no login de usuário. Erros: {@ModelStateErrors}", ModelState);
                return BadRequest(ModelState);
            }

            try
            {
                var token = await _AuthService.LoginAsync(dto);

                _logger.LogInformation(
                    "Login realizado com sucesso. Identifier utilizado: {Identifier}",
                    dto.Identifier
                );

                SetTokenCookie(token);
                return Ok(new 
                { 
                    message = "Login successful",
                    token = token 
                });
            }
            catch (ApplicationException ex)
            {
                _logger.LogWarning(ex,
                    "Erro de negócio no login. Identifier utilizado: {Identifier}. Mensagem: {Message}",
                    dto.Identifier,
                    ex.Message);

                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex,
                    "Erro inesperado ao realizar login. Identifier utilizado: {Identifier}",
                    dto.Identifier);

                return StatusCode(500, new { message = GenericErrorMessage, traceId = HttpContext.TraceIdentifier });
            }
        }

        [HttpPost("password-reset/request")]
        [EnableRateLimiting("AuthPolicy")]
        public async Task<IActionResult> RequestPasswordReset([FromBody] RequestPasswordResetDto dto)
        {
            if (!ModelState.IsValid)
            {
                _logger.LogWarning("ModelState inválido ao solicitar reset de senha. Erros: {@ModelStateErrors}", ModelState);
                return BadRequest(ModelState);
            }

            try
            {
                var message = await _AuthService.RequestPasswordResetAsync(dto);

                _logger.LogInformation(
                    "Pedido de reset de senha criado com sucesso. Email informado: {Email}",
                    dto.Email
                );

                return Ok(new { message });
            }
            catch (ApplicationException ex)
            {
                _logger.LogWarning(ex,
                    "Erro de negócio ao solicitar reset de senha. Email: {Email}. Mensagem: {Message}",
                    dto.Email,
                    ex.Message);

                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex,
                    "Erro inesperado ao solicitar reset de senha. Email: {Email}",
                    dto.Email);

                return StatusCode(500, new { message = GenericErrorMessage, traceId = HttpContext.TraceIdentifier });
            }
        }

        [HttpPost("password-reset/confirm")]
        public async Task<IActionResult> ConfirmPasswordReset([FromBody] ConfirmPasswordResetDto dto)
        {
            if (!ModelState.IsValid)
            {
                _logger.LogWarning("ModelState inválido ao confirmar reset de senha. Erros: {@ModelStateErrors}", ModelState);
                return BadRequest(ModelState);
            }

            try
            {
                var message = await _AuthService.ConfirmPasswordResetAsync(dto);

                _logger.LogInformation(
                    "Reset de senha confirmado com sucesso. Email informado: {Email}",
                    dto.Email
                );

                return Ok(new { message });
            }
            catch (ApplicationException ex)
            {
                _logger.LogWarning(ex,
                    "Erro de negócio ao confirmar reset de senha. Email: {Email}. Mensagem: {Message}",
                    dto.Email,
                    ex.Message);

                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex,
                    "Erro inesperado ao confirmar reset de senha. Email: {Email}",
                    dto.Email);

                return StatusCode(500, new { message = GenericErrorMessage, traceId = HttpContext.TraceIdentifier });
            }
        }

        [HttpGet("me")]
        [Microsoft.AspNetCore.Authorization.Authorize]
        public async Task<IActionResult> Me()
        {
            try
            {
                var userId = User.GetUserId();

                var profile = await _AuthService.GetUserProfileAsync(userId);
                return Ok(profile);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erro ao buscar perfil do usuário.");
                return StatusCode(500, new { message = GenericErrorMessage, traceId = HttpContext.TraceIdentifier });
            }
        }

        [HttpPost("logout")]
        public IActionResult Logout()
        {
            Response.Cookies.Delete(TokenCookieName, new CookieOptions
            {
                HttpOnly = true,
                Secure = !_env.IsDevelopment(),
                SameSite = _env.IsDevelopment() ? SameSiteMode.Lax : SameSiteMode.None
            });
            return Ok(new { message = "Logged out" });
        }
    }
}