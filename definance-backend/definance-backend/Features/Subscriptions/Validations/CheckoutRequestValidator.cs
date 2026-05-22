using FluentValidation;
using definance_backend.Features.Subscriptions.DTOs;

namespace definance_backend.Features.Subscriptions.Validations
{
    public class CheckoutRequestValidator : AbstractValidator<CheckoutRequest>
    {
        public CheckoutRequestValidator()
        {
            RuleFor(x => x.PlanType)
                .NotNull().WithMessage("O tipo de plano é obrigatório (Mensal ou Anual).")
                .IsInEnum().WithMessage("O tipo de plano informado é inválido.");
        }
    }
}