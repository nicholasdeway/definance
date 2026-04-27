using Dapper;
using definance_backend.Domain.Entities;
using Npgsql;

namespace definance_backend.Features.DailyExpenses.Repositories
{
    public class DailyExpenseRepository : IDailyExpenseRepository
    {
        private readonly string _connectionString;

        public DailyExpenseRepository(IConfiguration configuration)
        {
            _connectionString = configuration.GetConnectionString("DefaultConnection")!;
        }

        public async Task<IEnumerable<Expense>> GetDailySummaryAsync(Guid userId, DateTime date)
        {
            const string sql = @"
                SELECT 
                    id, user_id AS ""UserId"", name AS ""Name"", amount AS ""Amount"", 
                    category AS ""Category"", date::timestamp AS ""Date"", 
                    expense_type AS ""ExpenseType"", status AS ""Status"",
                    'Saída' as ""TransactionType""
                FROM expenses
                WHERE user_id = @UserId AND date::date = @Date::date
                ORDER BY ""Date"" DESC;
            ";

            await using var conn = new NpgsqlConnection(_connectionString);
            return await conn.QueryAsync<Expense>(sql, new { UserId = userId, Date = date });
        }
    }
}