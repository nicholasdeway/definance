using FluentValidation;
using definance_backend.Features.Auth.DTOs;

namespace definance_backend.Features.Auth.Validations
{
    public class RegisterUserDtoValidator : AbstractValidator<RegisterUserDto>
    {
        public RegisterUserDtoValidator()
        {
            RuleFor(x => x.FirstName)
                .NotEmpty().WithMessage("O primeiro nome é obrigatório.")
                .MaximumLength(50).WithMessage("O nome deve ter no máximo 50 caracteres.");

            RuleFor(x => x.LastName)
                .NotEmpty().WithMessage("O sobrenome é obrigatório.")
                .MaximumLength(50).WithMessage("O sobrenome deve ter no máximo 50 caracteres.");

            RuleFor(x => x.Email)
                .NotEmpty().WithMessage("O e-mail é obrigatório.")
                .EmailAddress().WithMessage("O e-mail informado é inválido.")
                .MaximumLength(120).WithMessage("O e-mail deve ter no máximo 120 caracteres.");

            RuleFor(x => x.Password)
                .NotEmpty().WithMessage("A senha é obrigatória.")
                .MinimumLength(8).WithMessage("A senha deve ter pelo menos 8 caracteres.");

            RuleFor(x => x.ConfirmPassword)
                .NotEmpty().WithMessage("A confirmação de senha é obrigatória.")
                .Equal(x => x.Password)
                .WithMessage("A confirmação de senha não coincide com a senha informada.");

            RuleFor(x => x.Phone)
                .Matches(@"^\+?[0-9]{10,15}$")
                .WithMessage("O telefone deve conter apenas números e ter entre 10 e 15 dígitos.")
                .When(x => !string.IsNullOrWhiteSpace(x.Phone));
        }
    }
}