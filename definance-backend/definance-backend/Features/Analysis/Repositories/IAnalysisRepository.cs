using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using definance_backend.Features.Analysis.DTOs;

namespace definance_backend.Features.Analysis.Repositories
{
    public interface IAnalysisRepository
    {
        Task<decimal> GetTotalIncomesAsync(Guid userId, DateTime startDate, DateTime endDate);
        Task<decimal> GetTotalExpensesAsync(Guid userId, DateTime startDate, DateTime endDate);
        Task<decimal> GetTotalOverdueBillsAsync(Guid userId);
        Task<int> GetPendingBillsCountAsync(Guid userId, DateTime startDate, DateTime endDate);
        Task<IEnumerable<MonthlyAnalysisDto>> GetMonthlyComparisonAsync(Guid userId, DateTime startDate, DateTime endDate);
        Task<IEnumerable<CategoryAnalysisDto>> GetCategoryAnalysisAsync(Guid userId, DateTime startDate, DateTime endDate);
        Task<IEnumerable<IncomeAnalysisDto>> GetIncomeAnalysisAsync(Guid userId, DateTime startDate, DateTime endDate);
        Task<IEnumerable<BalanceEvolutionDto>> GetBalanceEvolutionAsync(Guid userId, DateTime startDate, DateTime endDate);
    }
}