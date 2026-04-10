using System;
using System.Text.RegularExpressions;
using definance_backend.Domain.Entities;
using definance_backend.Features.Auth.DTOs;
using definance_backend.Features.Auth.Repositories;
using definance_backend.Common.Helpers;
using definance_backend.Common.Interfaces;
using Microsoft.Extensions.Configuration;

namespace definance_backend.Features.Auth.Services
{
    public class AuthService : IAuthService
    {
        private readonly IUserRepository _repository;
        private readonly IJwtService _jwtService;
        private readonly IEmailService _emailService;
        private readonly IConfiguration _configuration;

        // Hash falso para equalizar tempo de resposta e prevenir timing attack no login
        private const string _fakeHash =
            "$2a$11$aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa";

        public AuthService(IUserRepository repository, IJwtService jwtService, IEmailService emailService, IConfiguration configuration)
        {
            _repository = repository;
            _jwtService = jwtService;
            _emailService = emailService;
            _configuration = configuration;
        }

        public async Task<string> RegisterAsync(RegisterUserDto dto)
        {
            if (dto.Password != dto.ConfirmPassword)
                throw new ApplicationException("Senha e confirmação de senha não conferem.");

            var existing = await _repository.GetByEmailAsync(dto.Email);

            var firstName = NameFormatter.NormalizeName(dto.FirstName);
            var lastName = NameFormatter.NormalizeName(dto.LastName);

            var hashedPassword = BCrypt.Net.BCrypt.HashPassword(dto.Password);

            string? normalizedPhone = null;
            if (!string.IsNullOrWhiteSpace(dto.Phone))
            {
                var digits = Regex.Replace(dto.Phone, @"\D", "");
                normalizedPhone = digits;

                var existingByPhone = await _repository.GetByPhoneAsync(normalizedPhone);
                if (existingByPhone != null && existingByPhone.Id != existing?.Id)
                    throw new ApplicationException("Já existe um Usuário registrado com esse telefone.");
            }

            User user;

            if (existing is not null && existing.IsActive)
            {
                throw new ApplicationException("Já existe um Usuário registrado com esse e-mail.");
            }

            if (existing is not null && !existing.IsActive)
            {
                existing.FirstName = firstName;
                existing.LastName = lastName;
                existing.Email = dto.Email;
                existing.Password = hashedPassword;
                existing.Phone = normalizedPhone;
                existing.LastLoginAt = DateTime.UtcNow;
                existing.PasswordResetPending = false;
                existing.AuthProvider = "Local";
                existing.ProviderUserId = null;
                existing.ProviderEmail = null;
                existing.PictureUrl = null;
                existing.IsActive = true;
                existing.UpdatedAt = DateTime.UtcNow;

                user = await _repository.UpdateAsync(existing);
            }
            else
            {
                user = new User
                {
                    FirstName = firstName,
                    LastName = lastName,
                    Email = dto.Email,
                    Password = hashedPassword,
                    Phone = normalizedPhone,
                    CreatedAt = DateTime.UtcNow,
                    LastLoginAt = DateTime.UtcNow,
                    PasswordResetPending = false,
                    AuthProvider = "Local",
                    ProviderUserId = null,
                    ProviderEmail = null,
                    PictureUrl = null,
                    IsActive = true
                };

                user = await _repository.CreateAsync(user);
            }

            var token = _jwtService.GenerateToken(user);
            return token;
        }

        public async Task<string> LoginAsync(LoginUserDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.Identifier))
                throw new ApplicationException("E-mail ou telefone é obrigatório.");

            User? user;

            if (dto.Identifier.Contains("@"))
            {
                user = await _repository.GetByEmailAsync(dto.Identifier);
            }
            else
            {
                var digits = Regex.Replace(dto.Identifier, @"\D", "");
                if (string.IsNullOrWhiteSpace(digits))
                    throw new ApplicationException("Telefone informado é inválido.");

                user = await _repository.GetByPhoneAsync(digits);
            }

            if (user == null)
            {
                BCrypt.Net.BCrypt.Verify(dto.Password, _fakeHash);
                throw new ApplicationException("Usuário ou senha inválidos.");
            }

            if (!user.IsActive)
                throw new ApplicationException("Credenciais inválidas.");

            if (user.LockoutEnd.HasValue && user.LockoutEnd.Value > DateTime.UtcNow)
            {
                var remainingMinutes = (int)Math.Ceiling((user.LockoutEnd.Value - DateTime.UtcNow).TotalMinutes);
                throw new ApplicationException($"Conta temporariamente bloqueada. Tente novamente em {remainingMinutes} minuto(s).");
            }

            var isValid = BCrypt.Net.BCrypt.Verify(dto.Password, user.Password);
            if (!isValid)
            {
                user.FailedLoginAttempts++;
                if (user.FailedLoginAttempts >= 5)
                {
                    user.LockoutEnd = DateTime.UtcNow.AddMinutes(5);
                    await _repository.UpdateAsync(user);
                    throw new ApplicationException("Muitas tentativas falhas. Conta bloqueada por 5 minutos.");
                }

                await _repository.UpdateAsync(user);
                throw new ApplicationException("Usuário ou senha inválidos.");
            }

            user.FailedLoginAttempts = 0;
            user.LockoutEnd = null;
            user.LastLoginAt = DateTime.UtcNow;
            await _repository.UpdateAsync(user);

            var token = _jwtService.GenerateToken(user);
            return token;
        }

        public async Task<string> RequestPasswordResetAsync(RequestPasswordResetDto dto)
        {
            const string genericMessage = "Se o e-mail estiver cadastrado, você receberá as instruções de redefinição em breve.";

            var user = await _repository.GetByEmailAsync(dto.Email);

            if (user == null || !user.IsActive)
            {
                await Task.Delay(Random.Shared.Next(200, 500));
                return genericMessage;
            }

            // Token de 64 caracteres hexadecimais (256-bit cryptographically secure)
            var token = Convert.ToHexString(System.Security.Cryptography.RandomNumberGenerator.GetBytes(32)).ToLower();

            user.PasswordResetPending = true;
            user.PasswordResetToken = token;
            user.PasswordResetExpiresAt = DateTime.UtcNow.AddMinutes(15);

            await _repository.UpdateAsync(user);

            var frontendUrl = _configuration["Google:FrontendBaseUrl"] ?? "http://localhost:3000";
            var resetLink = $"{frontendUrl}/reset-password?email={user.Email}&token={token}";

            await _emailService.SendPasswordResetEmailAsync(user.Email, resetLink, user.FirstName, token);

            return genericMessage;
        }

        public async Task<string> ConfirmPasswordResetAsync(ConfirmPasswordResetDto dto)
        {
            var user = await _repository.GetByEmailAsync(dto.Email);
            if (user == null)
                throw new ApplicationException("Nenhum Usuário encontrado com esse e-mail.");

            if (!user.IsActive)
                throw new ApplicationException("Esta conta foi desativada.");

            if (!user.PasswordResetPending || user.PasswordResetToken != dto.Token)
                throw new ApplicationException("Token inválido ou não há solicitação de redefinição pendente.");

            if (user.PasswordResetExpiresAt < DateTime.UtcNow)
            {
                user.PasswordResetPending = false;
                user.PasswordResetToken = null;
                user.PasswordResetExpiresAt = null;
                await _repository.UpdateAsync(user);
                throw new ApplicationException("O código de redefinição expirou. Solicite um novo.");
            }

            if (dto.NewPassword != dto.ConfirmNewPassword)
                throw new ApplicationException("Nova senha e confirmação não conferem.");

            if (dto.NewPassword.Length < 8)
                throw new ApplicationException("A nova senha deve ter no mínimo 8 caracteres.");

            var hashedPassword = BCrypt.Net.BCrypt.HashPassword(dto.NewPassword);

            user.Password = hashedPassword;
            user.PasswordResetPending = false;
            user.PasswordResetToken = null;
            user.PasswordResetExpiresAt = null;

            await _repository.UpdateAsync(user);

            return "Senha redefinida com sucesso.";
        }

        public async Task<UserProfileDto> GetUserProfileAsync(Guid userId)
        {
            var user = await _repository.GetByIdAsync(userId);
            if (user == null)
                throw new ApplicationException("Usuário não encontrado.");

            return new UserProfileDto
            {
                Id = user.Id,
                Email = user.Email,
                FirstName = user.FirstName ?? "",
                LastName = user.LastName ?? "",
                Phone = user.Phone,
                PictureUrl = user.PictureUrl,
                AuthProvider = user.AuthProvider ?? "Local",
                HasCompletedOnboarding = user.HasCompletedOnboarding
            };
        }
    }
}