using FluentValidation;
using definance_backend.Features.Goals.DTOs;

namespace definance_backend.Features.Goals.Validations
{
    public class CreateUpdateGoalValidator : AbstractValidator<CreateUpdateGoalDto>
    {
        public CreateUpdateGoalValidator()
        {
            RuleFor(x => x.Name)
                .NotEmpty().WithMessage("O nome da meta é obrigatório.")
                .MaximumLength(100).WithMessage("O nome deve ter no máximo 100 caracteres.");

            RuleFor(x => x.TargetAmount)
                .GreaterThan(0).WithMessage("O valor alvo deve ser maior que zero.");

            RuleFor(x => x.StartDate)
                .NotEmpty().WithMessage("A data de início é obrigatória.")
                .GreaterThanOrEqualTo(DateTime.UtcNow.Date).WithMessage("A data de início não pode ser retroativa.");

            RuleFor(x => x.EndDate)
                .NotEmpty().WithMessage("A data de término é obrigatória.")
                .GreaterThan(x => x.StartDate).WithMessage("A data de término deve ser posterior à data de início.")
                .GreaterThanOrEqualTo(DateTime.UtcNow.Date).WithMessage("A data de término não pode ser retroativa.");

            RuleFor(x => x.ReserveDay)
                .InclusiveBetween(1, 31).WithMessage("O dia de reserva deve ser entre 1 e 31.");
        }
    }
}