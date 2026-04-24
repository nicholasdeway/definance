using Dapper;
using definance_backend.Domain.Entities;
using Npgsql;

namespace definance_backend.Features.Expenses.Repositories
{
    public class ExpenseRepository : IExpenseRepository
    {
        private readonly string _connectionString;

        public ExpenseRepository(IConfiguration configuration)
        {
            _connectionString = configuration.GetConnectionString("DefaultConnection")!;
        }

        public async Task<Expense?> GetByIdAsync(Guid id)
        {
            const string sql = @"
                SELECT
                    id,
                    user_id       AS ""UserId"",
                    name          AS ""Name"",
                    amount        AS ""Amount"",
                    category      AS ""Category"",
                    date::timestamp AS ""Date"",
                    expense_type  AS ""ExpenseType"",
                    status        AS ""Status"",
                    description   AS ""Description"",
                    notes         AS ""Notes"",
                    bill_id       AS ""BillId"",
                    due_date::timestamp AS ""DueDate"",
                    created_at    AS ""CreatedAt"",
                    updated_at    AS ""UpdatedAt""
                FROM expenses
                WHERE id = @Id;
            ";

            await using var conn = new NpgsqlConnection(_connectionString);
            return await conn.QueryFirstOrDefaultAsync<Expense>(sql, new { Id = id });
        }

        public async Task<IEnumerable<Expense>> GetByUserIdAsync(Guid userId, int? month = null, int? year = null, DateTime? startDate = null, DateTime? endDate = null)
        {
            var sql = @"
                SELECT
                    id,
                    user_id       AS ""UserId"",
                    name          AS ""Name"",
                    amount        AS ""Amount"",
                    category      AS ""Category"",
                    date::timestamp AS ""Date"",
                    expense_type  AS ""ExpenseType"",
                    status        AS ""Status"",
                    description   AS ""Description"",
                    notes         AS ""Notes"",
                    bill_id       AS ""BillId"",
                    due_date::timestamp AS ""DueDate"",
                    created_at    AS ""CreatedAt"",
                    updated_at    AS ""UpdatedAt""
                FROM expenses
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
            return await conn.QueryAsync<Expense>(sql, new { UserId = userId, Month = month, Year = year, StartDate = startDate, EndDate = endDate });
        }

        public async Task CreateAsync(Expense expense)
        {
            const string sql = @"
                INSERT INTO expenses (
                    id, user_id, name, amount, category, date, expense_type, status,
                    description, notes, bill_id, due_date, created_at, updated_at
                ) VALUES (
                    @Id, @UserId, @Name, @Amount, @Category, @Date, @ExpenseType, @Status,
                    @Description, @Notes, @BillId, @DueDate, NOW(), NOW()
                );
            ";

            await using var conn = new NpgsqlConnection(_connectionString);
            await conn.ExecuteAsync(sql, expense);
        }

        public async Task UpdateAsync(Expense expense)
        {
            const string sql = @"
                UPDATE expenses SET
                    name         = @Name,
                    amount       = @Amount,
                    category     = @Category,
                    date         = @Date,
                    expense_type = @ExpenseType,
                    status       = @Status,
                    description  = @Description,
                    notes        = @Notes,
                    bill_id      = @BillId,
                    due_date     = @DueDate,
                    updated_at   = NOW()
                WHERE id = @Id AND user_id = @UserId;
            ";

            await using var conn = new NpgsqlConnection(_connectionString);
            await conn.ExecuteAsync(sql, expense);
        }

        public async Task MarkAsPaidAsync(Guid id, Guid userId)
        {
            const string sql = @"
                UPDATE expenses SET
                    status     = 'Pago',
                    updated_at = NOW()
                WHERE id = @Id AND user_id = @UserId;
            ";

            await using var conn = new NpgsqlConnection(_connectionString);
            await conn.ExecuteAsync(sql, new { Id = id, UserId = userId });
        }

        public async Task DeleteAsync(Guid id)
        {
            const string sql = "DELETE FROM expenses WHERE id = @Id;";

            await using var conn = new NpgsqlConnection(_connectionString);
            await conn.ExecuteAsync(sql, new { Id = id });
        }
    }
}
