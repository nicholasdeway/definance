namespace definance_backend.Features.DailyExpenses.Services
{
    using definance_backend.Features.DailyExpenses.Models;

    public interface IQuickExpenseParser
    {
        ParsedExpenseResult Parse(string input);
    }
}