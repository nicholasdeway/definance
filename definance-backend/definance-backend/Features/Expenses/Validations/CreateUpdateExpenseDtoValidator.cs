using FluentValidation;
using definance_backend.Features.Expenses.DTOs;

namespace definance_backend.Features.Expenses.Validations
{
    public class CreateUpdateExpenseDtoValidator : AbstractValidator<CreateUpdateExpenseDto>
    {
        public CreateUpdateExpenseDtoValidator()
        {
            RuleFor(x => x.Name)
                .NotEmpty().WithMessage("O nome da despesa é obrigatório.")
                .MaximumLength(255).WithMessage("O nome não pode exceder 255 caracteres.");

            RuleFor(x => x.Amount)
                .GreaterThan(0).WithMessage("O valor da despesa deve ser maior que zero.");

            RuleFor(x => x.Category)
                .NotEmpty().WithMessage("A categoria da despesa é obrigatória.")
                .MaximumLength(100).WithMessage("A categoria não pode exceder 100 caracteres.");

            RuleFor(x => x.Date)
                .NotEmpty().WithMessage("A data da despesa é obrigatória.");

            RuleFor(x => x.ExpenseType)
                .Must(t => t == "Fixa" || t == "Variável")
                .WithMessage("O tipo deve ser 'Fixa' ou 'Variável'.");

            RuleFor(x => x.Status)
                .Must(s => s == "Pago" || s == "Pendente")
                .WithMessage("O status deve ser 'Pago' ou 'Pendente'.");
        }
    }
}
