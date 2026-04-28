using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Dapper;
using definance_backend.Features.Analysis.DTOs;
using Npgsql;
using Microsoft.Extensions.Configuration;

namespace definance_backend.Features.Analysis.Repositories
{
    public class AnalysisRepository : IAnalysisRepository
    {
        private readonly string _connectionString;

        public AnalysisRepository(IConfiguration configuration)
        {
            _connectionString = configuration.GetConnectionString("DefaultConnection")!;
        }

        public async Task<decimal> GetTotalIncomesAsync(Guid userId, DateTime startDate, DateTime endDate)
        {
            const string sql = @"
                SELECT COALESCE(SUM(amount), 0)
                FROM incomes
                WHERE user_id = @UserId AND date::timestamp >= @StartDate AND date::timestamp <= @EndDate;
            ";

            await using var conn = new NpgsqlConnection(_connectionString);
            return await conn.ExecuteScalarAsync<decimal>(sql, new { UserId = userId, StartDate = startDate, EndDate = endDate });
        }

        public async Task<decimal> GetTotalExpensesAsync(Guid userId, DateTime startDate, DateTime endDate)
        {
            const string sql = @"
                SELECT COALESCE(SUM(amount), 0)
                FROM expenses
                WHERE user_id = @UserId AND date::timestamp >= @StartDate AND date::timestamp <= @EndDate;
            ";

            await using var conn = new NpgsqlConnection(_connectionString);
            return await conn.ExecuteScalarAsync<decimal>(sql, new { UserId = userId, StartDate = startDate, EndDate = endDate });
        }

        public async Task<decimal> GetTotalOverdueBillsAsync(Guid userId)
        {
            const string sql = @"
                SELECT COALESCE(SUM(amount), 0)
                FROM bills
                WHERE user_id = @UserId 
                  AND status = 'Pendente' 
                  AND due_date::timestamp < NOW();
            ";

            await using var conn = new NpgsqlConnection(_connectionString);
            return await conn.ExecuteScalarAsync<decimal>(sql, new { UserId = userId });
        }

        public async Task<IEnumerable<MonthlyAnalysisDto>> GetMonthlyComparisonAsync(Guid userId, DateTime startDate, DateTime endDate)
        {
            const string sql = @"
                WITH months AS (
                    SELECT generate_series(
                        date_trunc('month', @StartDate::timestamp),
                        date_trunc('month', @EndDate::timestamp),
                        '1 month'::interval
                    ) AS month
                ),
                income_sums AS (
                    SELECT date_trunc('month', date::timestamp) as month, sum(amount) as total
                    FROM incomes
                    WHERE user_id = @UserId AND date::timestamp >= @StartDate AND date::timestamp <= @EndDate
                    GROUP BY 1
                ),
                expense_sums AS (
                    SELECT date_trunc('month', date::timestamp) as month, sum(amount) as total
                    FROM expenses
                    WHERE user_id = @UserId AND date::timestamp >= @StartDate AND date::timestamp <= @EndDate
                    GROUP BY 1
                )
                SELECT
                    to_char(m.month, 'Mon') as Month,
                    COALESCE(i.total, 0) as Receitas,
                    COALESCE(e.total, 0) as Despesas
                FROM months m
                LEFT JOIN income_sums i ON m.month = i.month
                LEFT JOIN expense_sums e ON m.month = e.month
                ORDER BY m.month;
            ";

            await using var conn = new NpgsqlConnection(_connectionString);
            return await conn.QueryAsync<MonthlyAnalysisDto>(sql, new { UserId = userId, StartDate = startDate, EndDate = endDate });
        }

        public async Task<IEnumerable<CategoryAnalysisDto>> GetCategoryAnalysisAsync(Guid userId, DateTime startDate, DateTime endDate)
        {
            const string sql = @"
                SELECT e.category as Categoria, SUM(e.amount) as Valor, MAX(c.monthly_limit) as MonthlyLimit
                FROM expenses e
                LEFT JOIN categories c ON e.category = c.name AND (c.user_id = @UserId OR c.is_system = true)
                WHERE e.user_id = @UserId AND e.date::timestamp >= @StartDate AND e.date::timestamp <= @EndDate
                GROUP BY e.category
                ORDER BY Valor DESC;
            ";

            await using var conn = new NpgsqlConnection(_connectionString);
            return await conn.QueryAsync<CategoryAnalysisDto>(sql, new { UserId = userId, StartDate = startDate, EndDate = endDate });
        }

        public async Task<IEnumerable<IncomeAnalysisDto>> GetIncomeAnalysisAsync(Guid userId, DateTime startDate, DateTime endDate)
        {
            const string sql = @"
                SELECT type as Tipo, sum(amount) as Valor
                FROM incomes
                WHERE user_id = @UserId AND date::timestamp >= @StartDate AND date::timestamp <= @EndDate
                GROUP BY type
                ORDER BY Valor DESC;
            ";

            await using var conn = new NpgsqlConnection(_connectionString);
            return await conn.QueryAsync<IncomeAnalysisDto>(sql, new { UserId = userId, StartDate = startDate, EndDate = endDate });
        }

        public async Task<IEnumerable<BalanceEvolutionDto>> GetBalanceEvolutionAsync(Guid userId, DateTime startDate, DateTime endDate)
        {
            const string sql = @"
                WITH monthly_net AS (
                    SELECT
                        date_trunc('month', date::timestamp) as month,
                        SUM(amount) as net
                    FROM (
                        SELECT date, amount FROM incomes WHERE user_id = @UserId
                        UNION ALL
                        SELECT date, -amount FROM expenses WHERE user_id = @UserId
                    ) combined
                    GROUP BY 1
                )
                SELECT
                    to_char(month, 'Mon') as Month,
                    SUM(net) OVER (ORDER BY month) as Saldo
                FROM monthly_net
                WHERE month >= date_trunc('month', @StartDate::timestamp) AND month <= @EndDate
                ORDER BY month;
            ";

            await using var conn = new NpgsqlConnection(_connectionString);
            return await conn.QueryAsync<BalanceEvolutionDto>(sql, new { UserId = userId, StartDate = startDate, EndDate = endDate });
        }
    }
}