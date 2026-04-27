using FluentValidation;
using definance_backend.Features.DailyExpenses.DTOs;

namespace definance_backend.Features.DailyExpenses.Validations
{
    public class QuickExpenseValidator : AbstractValidator<QuickExpenseRequestDto>
    {
        public QuickExpenseValidator()
        {
            RuleFor(x => x.Input)
                .NotEmpty().WithMessage("O texto do lançamento não pode estar vazio.")
                .MinimumLength(3).WithMessage("O texto do lançamento deve ter pelo menos 3 caracteres.");
        }
    }
}