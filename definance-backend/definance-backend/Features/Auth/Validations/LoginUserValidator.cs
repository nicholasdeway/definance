using FluentValidation;
using definance_backend.Features.Auth.DTOs;

namespace definance_backend.Features.Auth.Validations
{
    public class LoginUserValidator : AbstractValidator<LoginUserDto>
    {
        public LoginUserValidator()
        {
            RuleFor(x => x.Identifier)
                .NotEmpty().WithMessage("E-mail ou telefone é obrigatório.")
                .MinimumLength(4).WithMessage("O identificador deve ter no mínimo 4 caracteres.")
                .MaximumLength(120).WithMessage("O identificador deve ter no máximo 120 caracteres.");

            RuleFor(x => x.Password)
                .NotEmpty().WithMessage("A senha é obrigatória.")
                .MinimumLength(8).WithMessage("A senha deve ter pelo menos 8 caracteres.");
        }
    }
}