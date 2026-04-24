using Dapper;
using definance_backend.Domain.Entities;
using Npgsql;

namespace definance_backend.Features.Incomes.Repositories
{
    public class IncomeRepository : IIncomeRepository
    {
        private readonly string _connectionString;

        public IncomeRepository(IConfiguration configuration)
        {
            _connectionString = configuration.GetConnectionString("DefaultConnection")!;
        }

        public async Task<Income?> GetByIdAsync(Guid id)
        {
            const string sql = @"
                SELECT
                    id,
                    user_id       AS ""UserId"",
                    name          AS ""Name"",
                    amount        AS ""Amount"",
                    type          AS ""Type"",
                    date::timestamp AS ""Date"",
                    is_recurring  AS ""IsRecurring"",
                    created_at    AS ""CreatedAt"",
                    updated_at    AS ""UpdatedAt""
                FROM incomes
                WHERE id = @Id;
            ";

            await using var conn = new NpgsqlConnection(_connectionString);
            return await conn.QueryFirstOrDefaultAsync<Income>(sql, new { Id = id });
        }

        public async Task<IEnumerable<Income>> GetByUserIdAsync(Guid userId, int? month = null, int? year = null, DateTime? startDate = null, DateTime? endDate = null)
        {
            var sql = @"
                SELECT
                    id,
                    user_id       AS ""UserId"",
                    name          AS ""Name"",
                    amount        AS ""Amount"",
                    type          AS ""Type"",
                    date::timestamp AS ""Date"",
                    is_recurring  AS ""IsRecurring"",
                    created_at    AS ""CreatedAt"",
                    updated_at    AS ""UpdatedAt""
                FROM incomes
                WHERE user_id = @UserId
            ";

            if (startDate.HasValue && endDate.HasValue)
            {
                sql += " AND date >= @StartDate AND date <= @EndDate";
            }
            else
            {
                if (month.HasValue)
                {
                    sql += " AND EXTRACT(MONTH FROM date) = @Month";
                }
                if (year.HasValue)
                {
                    sql += " AND EXTRACT(YEAR FROM date) = @Year";
                }
            }

            sql += " ORDER BY date DESC;";

            await using var conn = new NpgsqlConnection(_connectionString);
            return await conn.QueryAsync<Income>(sql, new { UserId = userId, Month = month, Year = year, StartDate = startDate, EndDate = endDate });
        }

        public async Task CreateAsync(Income income)
        {
            const string sql = @"
                INSERT INTO incomes (
                    id, user_id, name, amount, type, date, is_recurring, created_at, updated_at
                ) VALUES (
                    @Id, @UserId, @Name, @Amount, @Type, @Date, @IsRecurring, NOW(), NOW()
                );
            ";

            await using var conn = new NpgsqlConnection(_connectionString);
            await conn.ExecuteAsync(sql, income);
        }

        public async Task UpdateAsync(Income income)
        {
            const string sql = @"
                UPDATE incomes SET
                    name = @Name,
                    amount = @Amount,
                    type = @Type,
                    date = @Date,
                    is_recurring = @IsRecurring,
                    updated_at = NOW()
                WHERE id = @Id AND user_id = @UserId;
            ";

            await using var conn = new NpgsqlConnection(_connectionString);
            await conn.ExecuteAsync(sql, income);
        }

        public async Task DeleteAsync(Guid id)
        {
            const string sql = "DELETE FROM incomes WHERE id = @Id;";

            await using var conn = new NpgsqlConnection(_connectionString);
            await conn.ExecuteAsync(sql, new { Id = id });
        }
    }
}