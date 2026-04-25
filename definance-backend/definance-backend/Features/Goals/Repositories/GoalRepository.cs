using Dapper;
using definance_backend.Domain.Entities;
using Npgsql;

namespace definance_backend.Features.Goals.Repositories
{
    public class GoalRepository : IGoalRepository
    {
        private readonly string _connectionString;

        public GoalRepository(IConfiguration configuration)
        {
            _connectionString = configuration.GetConnectionString("DefaultConnection")!;
        }

        public async Task<Goal?> GetByIdAsync(Guid id)
        {
            const string sql = @"
                SELECT 
                    id,
                    user_id          AS ""UserId"",
                    name             AS ""Name"",
                    target_amount    AS ""TargetAmount"",
                    current_amount   AS ""CurrentAmount"",
                    category         AS ""Category"",
                    start_date::timestamp AS ""StartDate"",
                    end_date::timestamp   AS ""EndDate"",
                    monthly_reserve  AS ""MonthlyReserve"",
                    reserve_day      AS ""ReserveDay"",
                    is_completed     AS ""IsCompleted"",
                    linked_bill_id   AS ""LinkedBillId"",
                    created_at       AS ""CreatedAt"",
                    updated_at       AS ""UpdatedAt""
                FROM goals
                WHERE id = @Id;
            ";

            await using var conn = new NpgsqlConnection(_connectionString);
            return await conn.QueryFirstOrDefaultAsync<Goal>(sql, new { Id = id });
        }

        public async Task<IEnumerable<Goal>> GetByUserIdAsync(Guid userId)
        {
            const string sql = @"
                SELECT 
                    id,
                    user_id          AS ""UserId"",
                    name             AS ""Name"",
                    target_amount    AS ""TargetAmount"",
                    current_amount   AS ""CurrentAmount"",
                    category         AS ""Category"",
                    start_date::timestamp AS ""StartDate"",
                    end_date::timestamp   AS ""EndDate"",
                    monthly_reserve  AS ""MonthlyReserve"",
                    reserve_day      AS ""ReserveDay"",
                    is_completed     AS ""IsCompleted"",
                    linked_bill_id   AS ""LinkedBillId"",
                    created_at       AS ""CreatedAt"",
                    updated_at       AS ""UpdatedAt""
                FROM goals
                WHERE user_id = @UserId
                ORDER BY created_at DESC;
            ";

            await using var conn = new NpgsqlConnection(_connectionString);
            return await conn.QueryAsync<Goal>(sql, new { UserId = userId });
        }

        public async Task CreateAsync(Goal goal)
        {
            const string sql = @"
                INSERT INTO goals (
                    id, user_id, name, target_amount, current_amount, category, 
                    start_date, end_date, monthly_reserve, reserve_day, 
                    is_completed, linked_bill_id, created_at, updated_at
                ) VALUES (
                    @Id, @UserId, @Name, @TargetAmount, @CurrentAmount, @Category, 
                    @StartDate, @EndDate, @MonthlyReserve, @ReserveDay, 
                    @IsCompleted, @LinkedBillId, NOW(), NOW()
                );
            ";

            await using var conn = new NpgsqlConnection(_connectionString);
            await conn.ExecuteAsync(sql, goal);
        }

        public async Task UpdateAsync(Goal goal)
        {
            const string sql = @"
                UPDATE goals SET
                    name            = @Name,
                    target_amount   = @TargetAmount,
                    current_amount  = @CurrentAmount,
                    category        = @Category,
                    start_date      = @StartDate,
                    end_date        = @EndDate,
                    monthly_reserve = @MonthlyReserve,
                    reserve_day     = @ReserveDay,
                    is_completed    = @IsCompleted,
                    linked_bill_id  = @LinkedBillId,
                    updated_at      = NOW()
                WHERE id = @Id AND user_id = @UserId;
            ";

            await using var conn = new NpgsqlConnection(_connectionString);
            await conn.ExecuteAsync(sql, goal);
        }

        public async Task DeleteAsync(Guid id, Guid userId)
        {
            const string sql = "DELETE FROM goals WHERE id = @Id AND user_id = @UserId;";
 
            await using var conn = new NpgsqlConnection(_connectionString);
            await conn.ExecuteAsync(sql, new { Id = id, UserId = userId });
        }
    }
}