using FluentValidation;
using definance_backend.Features.Auth.DTOs;

namespace definance_backend.Features.Auth.Validations
{
    public class RequestPasswordResetValidator : AbstractValidator<RequestPasswordResetDto>
    {
        public RequestPasswordResetValidator()
        {
            RuleFor(x => x.Email)
                .NotEmpty().WithMessage("O e-mail é obrigatório.")
                .EmailAddress().WithMessage("O e-mail informado é inválido.");
        }
    }
}