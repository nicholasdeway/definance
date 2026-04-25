using System;
using System.Threading.Tasks;
using definance_backend.Features.Analysis.DTOs;

namespace definance_backend.Features.Analysis.Services
{
    public interface IAnalysisService
    {
        Task<AnalysisDto> GetAnalysisAsync(Guid userId, int? month = null, int? year = null, DateTime? startDate = null, DateTime? endDate = null);
    }
}