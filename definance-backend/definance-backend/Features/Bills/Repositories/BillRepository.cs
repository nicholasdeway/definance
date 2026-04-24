using Dapper;
using definance_backend.Domain.Entities;
using Npgsql;

namespace definance_backend.Features.Bills.Repositories
{
    public class BillRepository : IBillRepository
    {
        private readonly string _connectionString;

        public BillRepository(IConfiguration configuration)
        {
            _connectionString = configuration.GetConnectionString("DefaultConnection")!;
        }

        public async Task<Bill?> GetByIdAsync(Guid id)
        {
            const string sql = @"
                SELECT
                    id,
                    user_id       AS ""UserId"",
                    name          AS ""Name"",
                    amount        AS ""Amount"",
                    category      AS ""Category"",
                    bill_type     AS ""BillType"",
                    due_day       AS ""DueDay"",
                    due_date::timestamp AS ""DueDate"",
                    status        AS ""Status"",
                    is_recurring  AS ""IsRecurring"",
                    description   AS ""Description"",
                    notes         AS ""Notes"",
                    goal_id       AS ""GoalId"",
                    created_at    AS ""CreatedAt"",
                    updated_at    AS ""UpdatedAt""
                FROM bills
                WHERE id = @Id;
            ";

            await using var conn = new NpgsqlConnection(_connectionString);
            return await conn.QueryFirstOrDefaultAsync<Bill>(sql, new { Id = id });
        }

        public async Task<IEnumerable<Bill>> GetByUserIdAsync(Guid userId, int? month = null, int? year = null, DateTime? startDate = null, DateTime? endDate = null)
        {
            var sql = @"
                SELECT
                    id,
                    user_id       AS ""UserId"",
                    name          AS ""Name"",
                    amount        AS ""Amount"",
                    category      AS ""Category"",
                    bill_type     AS ""BillType"",
                    due_day       AS ""DueDay"",
                    due_date::timestamp AS ""DueDate"",
                    status        AS ""Status"",
                    is_recurring  AS ""IsRecurring"",
                    description   AS ""Description"",
                    notes         AS ""Notes"",
                    goal_id       AS ""GoalId"",
                    created_at    AS ""CreatedAt"",
                    updated_at    AS ""UpdatedAt""
                FROM bills
                WHERE user_id = @UserId
            ";

            if (startDate.HasValue && endDate.HasValue)
            {
                sql += " AND (due_date >= @StartDate AND due_date <= @EndDate OR due_date IS NULL)";
            }
            else if (month.HasValue && year.HasValue)
            {
                sql += @" AND (
                    (EXTRACT(MONTH FROM due_date) = @Month AND EXTRACT(YEAR FROM due_date) = @Year) 
                    OR (due_date IS NULL)
                    OR (is_recurring = true AND status = 'Pendente' AND (EXTRACT(YEAR FROM due_date) < @Year OR (EXTRACT(YEAR FROM due_date) = @Year AND EXTRACT(MONTH FROM due_date) < @Month)))
                )";
            }

            sql += @"
                ORDER BY
                    CASE status
                        WHEN 'Atrasado' THEN 0
                        WHEN 'Pendente' THEN 1
                        WHEN 'Pago'     THEN 2
                    END,
                    due_date ASC NULLS LAST;
            ";

            await using var conn = new NpgsqlConnection(_connectionString);
            return await conn.QueryAsync<Bill>(sql, new { UserId = userId, Month = month, Year = year, StartDate = startDate, EndDate = endDate });
        }

        public async Task CreateAsync(Bill bill)
        {
            const string sql = @"
                INSERT INTO bills (
                    id, user_id, name, amount, category, bill_type, due_day, due_date,
                    status, is_recurring, description, notes, goal_id, created_at, updated_at
                ) VALUES (
                    @Id, @UserId, @Name, @Amount, @Category, @BillType, @DueDay, @DueDate,
                    @Status, @IsRecurring, @Description, @Notes, @GoalId, NOW(), NOW()
                );
            ";

            await using var conn = new NpgsqlConnection(_connectionString);
            await conn.ExecuteAsync(sql, bill);
        }

        public async Task UpdateAsync(Bill bill)
        {
            const string sql = @"
                UPDATE bills SET
                    name         = @Name,
                    amount       = @Amount,
                    category     = @Category,
                    bill_type    = @BillType,
                    due_day      = @DueDay,
                    due_date     = @DueDate,
                    status       = @Status,
                    is_recurring = @IsRecurring,
                    description  = @Description,
                    notes        = @Notes,
                    goal_id      = @GoalId,
                    updated_at   = NOW()
                WHERE id = @Id AND user_id = @UserId;
            ";

            await using var conn = new NpgsqlConnection(_connectionString);
            await conn.ExecuteAsync(sql, bill);
        }

        public async Task DeleteAsync(Guid id)
        {
            const string sql = "DELETE FROM bills WHERE id = @Id;";

            await using var conn = new NpgsqlConnection(_connectionString);
            await conn.ExecuteAsync(sql, new { Id = id });
        }
    }
}