using FluentValidation;
using definance_backend.Features.Goals.DTOs;

namespace definance_backend.Features.Goals.Validations
{
    public class DepositGoalValidator : AbstractValidator<DepositGoalDto>
    {
        public DepositGoalValidator()
        {
            RuleFor(x => x.Amount)
                .GreaterThan(0).WithMessage("O valor do depósito deve ser maior que zero.");
        }
    }
}