using System.Collections.Generic;

namespace definance_backend.Features.Analysis.DTOs
{
    public class AnalysisDto
    {
        public decimal TotalReceitas { get; set; }
        public decimal TotalDespesas { get; set; }
        public decimal TotalAtrasadas { get; set; }
        public int ContasPendentes { get; set; }
        public decimal SaldoFinal { get; set; }
        public List<MonthlyAnalysisDto> MonthlyComparison { get; set; } = new();
        public List<CategoryAnalysisDto> CategoryAnalysis { get; set; } = new();
        public List<IncomeAnalysisDto> IncomeAnalysis { get; set; } = new();
        public List<BalanceEvolutionDto> BalanceEvolution { get; set; } = new();
    }

    public class MonthlyAnalysisDto
    {
        public string Month { get; set; }
        public decimal Receitas { get; set; }
        public decimal Despesas { get; set; }
    }

    public class CategoryAnalysisDto
    {
        public string Categoria { get; set; }
        public decimal Valor { get; set; }
        public decimal? MonthlyLimit { get; set; }
    }

    public class BalanceEvolutionDto
    {
        public string Month { get; set; }
        public decimal Saldo { get; set; }
    }

    public class IncomeAnalysisDto
    {
        public string Tipo { get; set; }
        public decimal Valor { get; set; }
    }
}