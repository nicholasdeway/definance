using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Google;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.WebUtilities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.Extensions.Options;
using definance_backend.Domain.Entities;
using definance_backend.Features.Auth.Services;
using definance_backend.Common.Settings;
using definance_backend.Features.Auth.Repositories;

namespace definance_backend.Features.Auth.Controllers
{
    [ApiController]
    [Route("api/auth/google")]
    public class GoogleAuthController : ControllerBase
    {
        private readonly IUserRepository _userRepository;
        private readonly IJwtService _jwtService;
        private readonly GoogleSettings _googleSettings;
        private readonly ILogger<GoogleAuthController> _logger;
        private readonly string _frontendBase;

        public GoogleAuthController(
            IUserRepository userRepository,
            IJwtService jwtService,
            IOptions<GoogleSettings> googleOptions,
            IConfiguration configuration,
            ILogger<GoogleAuthController> logger)
        {
            _userRepository = userRepository;
            _jwtService = jwtService;
            _googleSettings = googleOptions.Value;
            _logger = logger;

            _frontendBase =
                configuration["Google:FrontendBaseUrl"]
                ?? configuration["FrontendBaseUrl"]
                ?? "http://localhost:3000";
        }

        [HttpGet("login")]
        public IActionResult Login([FromQuery] string? returnUrl = null)
        {
            var callbackUrl = Url.Action(
                nameof(Callback),
                "GoogleAuth",
                new { returnUrl },
                Request.Scheme)!;

            var props = new AuthenticationProperties
            {
                RedirectUri = callbackUrl
            };

            return Challenge(props, GoogleDefaults.AuthenticationScheme);
        }

        [HttpGet("callback")]
        public async Task<IActionResult> Callback([FromQuery] string? returnUrl = null)
        {
            var externalResult = await HttpContext.AuthenticateAsync("External");

            if (!externalResult.Succeeded || externalResult.Principal == null)
            {
                _logger.LogWarning("Falha ao autenticar cookie externo do Google.");
                return Redirect($"{_frontendBase}/auth/login?googleError=external_auth_failed");
            }

            var principal = externalResult.Principal;

            try
            {
                var token = await UpsertUserFromGoogleAsync(principal);

                await HttpContext.SignOutAsync("External");

                var finalReturnUrl = string.IsNullOrWhiteSpace(returnUrl) ? "/" : returnUrl;

                var finishUrl = QueryHelpers.AddQueryString(
                    $"{_frontendBase}/api-proxy/api/auth/google/finish-login",
                    new Dictionary<string, string?>
                    {
                        ["token"] = token,
                        ["returnUrl"] = finalReturnUrl
                    });

                return Redirect(finishUrl);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erro ao processar Callback do Google.");
                return Redirect($"{_frontendBase}/auth/login?googleError=server_error");
            }
        }

        [HttpGet("finish-login")]
        [AllowAnonymous]
        public IActionResult FinishLogin([FromQuery] string token, [FromQuery] string? returnUrl = null)
        {
            if (string.IsNullOrWhiteSpace(token))
                return BadRequest("Token is required");

            SetTokenCookie(token);

            var finalReturnUrl = string.IsNullOrWhiteSpace(returnUrl) ? "/" : returnUrl;
            
            return Redirect($"{_frontendBase}/auth/google/callback?returnUrl={finalReturnUrl}");
        }

        private void SetTokenCookie(string token)
        {
            var cookieOptions = new CookieOptions
            {
                HttpOnly = true,
                Secure = true,
                SameSite = SameSiteMode.None,
                Expires = DateTime.UtcNow.AddMinutes(480),
                IsEssential = true
            };
            Response.Cookies.Append("definance_token", token, cookieOptions);
        }

        // ========= Helpers =========

        private async Task<string> UpsertUserFromGoogleAsync(ClaimsPrincipal principal)
        {
            var sub = principal.FindFirst(ClaimTypes.NameIdentifier)?.Value
                   ?? principal.FindFirst("sub")?.Value;

            var emailRaw = principal.FindFirst(ClaimTypes.Email)?.Value ?? string.Empty;
            var email = emailRaw.Trim();
            var emailNorm = email.ToLowerInvariant();

            var displayName = principal.FindFirst(ClaimTypes.Name)?.Value;
            var picture = principal.FindFirst("picture")?.Value;

            if (string.IsNullOrWhiteSpace(sub))
                throw new InvalidOperationException("Google retornou 'sub' vazio.");

            if (string.IsNullOrWhiteSpace(emailNorm))
                throw new InvalidOperationException("Google retornou email vazio.");

            var user = await _userRepository.GetByEmailAsync(emailNorm);

            if (user is null)
            {
                SplitName(displayName, out var firstName, out var lastName);

                var randomPassword = Guid.NewGuid().ToString("N") + Guid.NewGuid().ToString("N");
                var hashedPassword = BCrypt.Net.BCrypt.HashPassword(randomPassword);

                user = new User
                {
                    FirstName = firstName,
                    LastName = lastName,
                    Email = emailNorm,
                    Password = hashedPassword,
                    CreatedAt = DateTime.UtcNow,
                    PasswordResetPending = false,

                    AuthProvider = "Google",
                    ProviderUserId = sub,
                    ProviderEmail = emailNorm,
                    PictureUrl = picture,

                    LastLoginAt = DateTime.UtcNow,
                    IsActive = true
                };

                user = await _userRepository.CreateAsync(user);
            }
            else
            {
                if (string.IsNullOrWhiteSpace(user.AuthProvider) || user.AuthProvider == "Local")
                    user.AuthProvider = "Google";

                if (string.IsNullOrWhiteSpace(user.ProviderUserId))
                    user.ProviderUserId = sub;

                if (string.IsNullOrWhiteSpace(user.ProviderEmail))
                    user.ProviderEmail = emailNorm;

                if (!string.IsNullOrWhiteSpace(picture))
                    user.PictureUrl = picture;

                if (!user.IsActive)
                {
                    user.IsActive = true;
                }

                user.LastLoginAt = DateTime.UtcNow;

                user = await _userRepository.UpdateAsync(user);
            }

            var token = _jwtService.GenerateToken(user);
            return token;
        }

        private static void SplitName(string? displayName, out string firstName, out string lastName)
        {
            if (string.IsNullOrWhiteSpace(displayName))
            {
                firstName = "Usuário";
                lastName = "Google";
                return;
            }

            var parts = displayName.Trim().Split(' ', StringSplitOptions.RemoveEmptyEntries);

            if (parts.Length == 1)
            {
                firstName = definance_backend.Common.Helpers.NameFormatter.NormalizeName(parts[0]);
                lastName = "";
            }
            else
            {
                firstName = definance_backend.Common.Helpers.NameFormatter.NormalizeName(parts[0]);
                lastName = definance_backend.Common.Helpers.NameFormatter.NormalizeName(string.Join(' ', parts.Skip(1)));
            }
        }
    }
}