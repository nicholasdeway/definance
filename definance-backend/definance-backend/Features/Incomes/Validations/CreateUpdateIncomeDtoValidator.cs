using FluentValidation;
using definance_backend.Features.Incomes.DTOs;

namespace definance_backend.Features.Incomes.Validations
{
    public class CreateUpdateIncomeDtoValidator : AbstractValidator<CreateUpdateIncomeDto>
    {
        public CreateUpdateIncomeDtoValidator()
        {
            RuleFor(x => x.Name)
                .NotEmpty().WithMessage("O nome da regra de entrada é obrigatório.")
                .MaximumLength(255).WithMessage("O nome não pode exceder 255 caracteres.");

            RuleFor(x => x.Amount)
                .GreaterThan(0).WithMessage("O valor da receita deve ser maior que zero.");

            RuleFor(x => x.Type)
                .NotEmpty().WithMessage("O tipo de receita é obrigatório.")
                .MaximumLength(100).WithMessage("O tipo de receita não pode exceder 100 caracteres.");

            RuleFor(x => x.Date)
                .NotEmpty().WithMessage("A data da receita é obrigatória.");
        }
    }
}