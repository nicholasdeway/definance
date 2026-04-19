using System.Collections.Generic;

namespace definance_backend.Features.Onboarding.DTOs
{
    public class OnboardingSubmissionDto
    {
        public int CurrentStep { get; set; } = 1;
        public List<string> SelectedIncomeTypes { get; set; } = new();
        public string MonthlyIncome { get; set; } = "0";
        public Dictionary<string, string> SelectedExpenses { get; set; } = new();
        public List<CustomExpenseDto> CustomExpenses { get; set; } = new();
        public Dictionary<string, BillLoanDto> BillLoans { get; set; } = new();
        public List<VehicleDto> Vehicles { get; set; } = new();
        public List<DebtDto> Debts { get; set; } = new();
    }

    public class CustomExpenseDto
    {
        public string Id { get; set; } = null!;
        public string Titulo { get; set; } = null!;
        public string Valor { get; set; } = "0";
    }

    public class BillLoanDto
    {
        public bool HasLoan { get; set; }
        public string Valor { get; set; } = "0";
    }

    public class VehicleDto
    {
        public string Id { get; set; } = null!;
        public string Tipo { get; set; } = null!;
        public string Nome { get; set; } = null!;
        public string Ano { get; set; } = null!;
        public string Ipva { get; set; } = "0";
        public string Multas { get; set; } = "0";
        public bool Financiado { get; set; }
        public string? ParcelasTotal { get; set; }
        public string? ParcelasPagas { get; set; }
        public string? ValorParcela { get; set; }
        public bool Seguro { get; set; }
        public string? ValorSeguro { get; set; }
        public List<ExtraExpenseDto> Extras { get; set; } = new();
    }

    public class DebtDto
    {
        public string Id { get; set; } = null!;
        public string Descricao { get; set; } = null!;
        public string Valor { get; set; } = "0";
        public bool Parcelado { get; set; }
        public string? ParcelasTotal { get; set; }
        public string? ParcelasPagas { get; set; }
        public List<ExtraExpenseDto> Extras { get; set; } = new();
    }

    public class ExtraExpenseDto
    {
        public string Id { get; set; } = null!;
        public string Descricao { get; set; } = null!;
        public string Valor { get; set; } = "0";
    }
}