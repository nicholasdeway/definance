using System;

namespace definance_backend.Features.Onboarding.DTOs
{
    public class GettingStartedStatusDto
    {
        public bool HasCategories { get; set; }
        public bool HasTransactions { get; set; }
        public int CompletedStepsCount { get; set; }
        public int TotalStepsCount { get; set; }
        public decimal ProgressPercentage => TotalStepsCount > 0 ? (decimal)CompletedStepsCount / TotalStepsCount * 100 : 0;
    }
}