using System;
using System.Linq;
using System.Threading.Tasks;
using definance_backend.Features.Analysis.Repositories;
using definance_backend.Features.Analysis.DTOs;

namespace definance_backend.Features.Analysis.Services
{
    public class AnalysisService : IAnalysisService
    {
        private readonly IAnalysisRepository _analysisRepository;

        public AnalysisService(IAnalysisRepository analysisRepository)
        {
            _analysisRepository = analysisRepository;
        }

        public async Task<AnalysisDto> GetAnalysisAsync(Guid userId, int? month = null, int? year = null, DateTime? startDate = null, DateTime? endDate = null)
        {
            DateTime start;
            DateTime end;

            if (startDate.HasValue && endDate.HasValue)
            {
                start = startDate.Value;
                end = endDate.Value;
            }
            else if (month.HasValue && year.HasValue)
            {
                start = new DateTime(year.Value, month.Value, 1, 0, 0, 0, DateTimeKind.Utc);
                end = start.AddMonths(1).AddTicks(-1);
            }
            else
            {
                end = DateTime.UtcNow;
                start = new DateTime(end.Year, end.Month, 1, 0, 0, 0, DateTimeKind.Utc);
            }

            // Para os gráficos de evolução, pegamos sempre um período maior (6 meses atrás até o fim do período atual)
            var chartStart = end.AddMonths(-6);

            var totalReceitasTask = _analysisRepository.GetTotalIncomesAsync(userId, start, end);
            var totalDespesasTask = _analysisRepository.GetTotalExpensesAsync(userId, start, end);
            var totalAtrasadasTask = _analysisRepository.GetTotalOverdueBillsAsync(userId);
            var monthlyComparisonTask = _analysisRepository.GetMonthlyComparisonAsync(userId, chartStart, end);
            var categoryAnalysisTask = _analysisRepository.GetCategoryAnalysisAsync(userId, start, end);
            var incomeAnalysisTask = _analysisRepository.GetIncomeAnalysisAsync(userId, start, end);
            var balanceEvolutionTask = _analysisRepository.GetBalanceEvolutionAsync(userId, chartStart, end);

            await Task.WhenAll(totalReceitasTask, totalDespesasTask, totalAtrasadasTask, monthlyComparisonTask, categoryAnalysisTask, incomeAnalysisTask, balanceEvolutionTask);

            return new AnalysisDto
            {
                TotalReceitas = await totalReceitasTask,
                TotalDespesas = await totalDespesasTask,
                TotalAtrasadas = await totalAtrasadasTask,
                SaldoFinal = (await totalReceitasTask) - (await totalDespesasTask),
                MonthlyComparison = (await monthlyComparisonTask).ToList(),
                CategoryAnalysis = (await categoryAnalysisTask).ToList(),
                IncomeAnalysis = (await incomeAnalysisTask).ToList(),
                BalanceEvolution = (await balanceEvolutionTask).ToList()
            };
        }
    }
}