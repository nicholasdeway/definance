using System.Collections.Generic;

namespace definance_backend.Features.Onboarding.DTOs
{
    public class OnboardingSubmissionDto
    {
        public int CurrentStep { get; set; } = 1;
        public List<string> Motivations { get; set; } = new();
        public List<string> SelectedIncomeTypes { get; set; } = new();
        public List<IncomeDetailDto> Incomes { get; set; } = new();
        public Dictionary<string, decimal> SelectedExpenses { get; set; } = new();
        public List<CustomExpenseDto> CustomExpenses { get; set; } = new();
        public Dictionary<string, BillLoanDto> BillLoans { get; set; } = new();
        public List<VehicleDto> Vehicles { get; set; } = new();
        public List<DebtDto> Debts { get; set; } = new();
    }

    public class IncomeDetailDto
    {
        public string Tipo { get; set; } = null!;
        public decimal Valor { get; set; } = 0;
        public string Frequencia { get; set; } = "fixo_mensal";
        public string DiasRecebimento { get; set; } = "";
        public string? ConfiguradoEm { get; set; }
        public PreviousConfigDto? ConfiguracaoAnterior { get; set; }
    }

    public class PreviousConfigDto
    {
        public decimal Valor { get; set; }
        public string Frequencia { get; set; } = null!;
        public string? DiasRecebimento { get; set; }
        public string ValidoAte { get; set; } = null!;
    }

    public class CustomExpenseDto
    {
        public string Id { get; set; } = null!;
        public string Titulo { get; set; } = null!;
        public decimal Valor { get; set; } = 0;
    }

    public class BillLoanDto
    {
        public bool HasLoan { get; set; }
        public decimal Valor { get; set; } = 0;
    }

    public class VehicleDto
    {
        public string Id { get; set; } = null!;
        public string Tipo { get; set; } = null!;
        public string Nome { get; set; } = null!;
        public string Ano { get; set; } = null!;
        public decimal Multas { get; set; } = 0;
        public bool Financiado { get; set; }
        public int? ParcelasTotal { get; set; }
        public int? ParcelasPagas { get; set; }
        public decimal? ValorParcela { get; set; }
        public bool Seguro { get; set; }
        public decimal? ValorSeguro { get; set; }
        public string? VencimentoSeguro { get; set; }
        public bool? SeguroRecorrente { get; set; }
        public List<ExtraExpenseDto> Extras { get; set; } = new();
        public List<IpvaYearDto> IpvaAnos { get; set; } = new();
    }

    public class IpvaYearDto
    {
        public string Id { get; set; } = null!;
        public string Ano { get; set; } = null!;
        public List<IpvaInstallmentDto> Parcelas { get; set; } = new();
    }

    public class IpvaInstallmentDto
    {
        public string Id { get; set; } = null!;
        public decimal Valor { get; set; } = 0;
        public string Vencimento { get; set; } = null!;
    }

    public class DebtDto
    {
        public string Id { get; set; } = null!;
        public string Descricao { get; set; } = null!;
        public decimal Valor { get; set; } = 0;
        public bool Parcelado { get; set; }
        public int? ParcelasTotal { get; set; }
        public int? ParcelasPagas { get; set; }
        public List<ExtraExpenseDto> Extras { get; set; } = new();
    }

    public class ExtraExpenseDto
    {
        public string Id { get; set; } = null!;
        public string Descricao { get; set; } = null!;
        public decimal Valor { get; set; } = 0;
    }
}