using FluentValidation;
using definance_backend.Features.Bills.DTOs;

namespace definance_backend.Features.Bills.Validations
{
    public class CreateUpdateBillDtoValidator : AbstractValidator<CreateUpdateBillDto>
    {
        public CreateUpdateBillDtoValidator()
        {
            RuleFor(x => x.Name)
                .NotEmpty().WithMessage("O nome da conta é obrigatório.")
                .MaximumLength(255).WithMessage("O nome não pode exceder 255 caracteres.");

            RuleFor(x => x.Amount)
                .GreaterThan(0).WithMessage("O valor da conta deve ser maior que zero.");

            RuleFor(x => x.BillType)
                .Must(t => t == "Fixa" || t == "Variável")
                .WithMessage("O tipo deve ser 'Fixa' ou 'Variável'.");

            RuleFor(x => x.Status)
                .Must(s => s == "Pendente" || s == "Pago" || s == "Atrasado")
                .WithMessage("O status deve ser 'Pendente', 'Pago' ou 'Atrasado'.");

            RuleFor(x => x.DueDay)
                .InclusiveBetween(1, 31).When(x => x.DueDay.HasValue)
                .WithMessage("O dia de vencimento deve ser entre 1 e 31.");
        }
    }
}