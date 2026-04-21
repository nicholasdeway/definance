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
                    created_at    AS ""CreatedAt"",
                    updated_at    AS ""UpdatedAt""
                FROM bills
                WHERE id = @Id;
            ";

            await using var conn = new NpgsqlConnection(_connectionString);
            return await conn.QueryFirstOrDefaultAsync<Bill>(sql, new { Id = id });
        }

        public async Task<IEnumerable<Bill>> GetByUserIdAsync(Guid userId)
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
                    created_at    AS ""CreatedAt"",
                    updated_at    AS ""UpdatedAt""
                FROM bills
                WHERE user_id = @UserId
                ORDER BY
                    CASE status
                        WHEN 'Atrasado' THEN 0
                        WHEN 'Pendente' THEN 1
                        WHEN 'Pago'     THEN 2
                    END,
                    due_date ASC NULLS LAST;
            ";

            await using var conn = new NpgsqlConnection(_connectionString);
            return await conn.QueryAsync<Bill>(sql, new { UserId = userId });
        }

        public async Task CreateAsync(Bill bill)
        {
            const string sql = @"
                INSERT INTO bills (
                    id, user_id, name, amount, category, bill_type, due_day, due_date,
                    status, is_recurring, description, notes, created_at, updated_at
                ) VALUES (
                    @Id, @UserId, @Name, @Amount, @Category, @BillType, @DueDay, @DueDate,
                    @Status, @IsRecurring, @Description, @Notes, NOW(), NOW()
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