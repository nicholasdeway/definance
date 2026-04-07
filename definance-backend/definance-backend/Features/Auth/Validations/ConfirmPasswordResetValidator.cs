using FluentValidation;
using definance_backend.Features.Auth.DTOs;

namespace definance_backend.Features.Auth.Validations
{
    public class ConfirmPasswordResetValidator : AbstractValidator<ConfirmPasswordResetDto>
    {
        public ConfirmPasswordResetValidator()
        {
            RuleFor(x => x.Email)
                .NotEmpty().WithMessage("O e-mail é obrigatório.")
                .EmailAddress().WithMessage("O e-mail informado é inválido.");

            RuleFor(x => x.NewPassword)
                .NotEmpty().WithMessage("A nova senha é obrigatória.")
                .MinimumLength(8).WithMessage("A nova senha deve ter pelo menos 8 caracteres.");

            RuleFor(x => x.ConfirmNewPassword)
                .NotEmpty().WithMessage("A confirmação da nova senha é obrigatória.")
                .MinimumLength(8).WithMessage("A confirmação da nova senha deve ter pelo menos 8 caracteres.");

            RuleFor(x => x)
                .Must(x => x.NewPassword == x.ConfirmNewPassword)
                .WithMessage("A confirmação da senha não confere.");
        }
    }
}
