using FluentValidation;
using definance_backend.Features.Categories.DTOs;

namespace definance_backend.Features.Categories.Validations
{
    public class CreateCategoryDtoValidator : AbstractValidator<CreateCategoryDto>
    {
        public CreateCategoryDtoValidator()
        {
            RuleFor(x => x.Name)
                .NotEmpty().WithMessage("O nome da categoria é obrigatório.")
                .MaximumLength(50).WithMessage("O nome da categoria deve ter no máximo 50 caracteres.")
                .Matches(@"^[a-zA-Z0-9\sáàâãéèêíïóôõöúçñÁÀÂÃÉÈÊÍÏÓÔÕÖÚÇÑ]+$")
                .WithMessage("O nome deve conter apenas letras, números e espaços.");

            RuleFor(x => x.Color)
                .Matches(@"^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$")
                .When(x => !string.IsNullOrEmpty(x.Color))
                .WithMessage("Formato de cor inválido. Use hexadecimal (#RRGGBB).");

            RuleFor(x => x.Type)
                .NotEmpty().WithMessage("O tipo da categoria é obrigatório.")
                .Must(x => new[] { "Entrada", "Saída", "Ambos" }.Contains(x))
                .WithMessage("O tipo deve ser 'Entrada', 'Saída' ou 'Ambos'.");
        }
    }

    public class UpdateCategoryDtoValidator : AbstractValidator<UpdateCategoryDto>
    {
        public UpdateCategoryDtoValidator()
        {
            RuleFor(x => x.Name)
                .NotEmpty().WithMessage("O nome da categoria é obrigatório.")
                .MaximumLength(50).WithMessage("O nome da categoria deve ter no máximo 50 caracteres.")
                .Matches(@"^[a-zA-Z0-9\sáàâãéèêíïóôõöúçñÁÀÂÃÉÈÊÍÏÓÔÕÖÚÇÑ]+$")
                .WithMessage("O nome deve conter apenas letras, números e espaços.");

            RuleFor(x => x.Color)
                .Matches(@"^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$")
                .When(x => !string.IsNullOrEmpty(x.Color))
                .WithMessage("Formato de cor inválido. Use hexadecimal (#RRGGBB).");

            RuleFor(x => x.Type)
                .NotEmpty().WithMessage("O tipo da categoria é obrigatório.")
                .Must(x => new[] { "Entrada", "Saída", "Ambos" }.Contains(x))
                .WithMessage("O tipo deve ser 'Entrada', 'Saída' ou 'Ambos'.");
        }
    }
}