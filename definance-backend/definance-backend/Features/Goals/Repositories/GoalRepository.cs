using Dapper;
using definance_backend.Domain.Entities;
using Npgsql;
using definance_backend.Features.Goals.DTOs;

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

        public async Task DeleteWithCascadeAsync(Guid id, Guid userId, bool deleteTransactions)
        {
            await using var conn = new NpgsqlConnection(_connectionString);
            await conn.OpenAsync();
            await using var transaction = await conn.BeginTransactionAsync();

            try
            {
                if (deleteTransactions)
                {
                    // 1. Deletar despesas vinculadas a qualquer conta dessa meta
                    const string deleteExpensesSql = @"
                        DELETE FROM expenses 
                        WHERE bill_id IN (SELECT id FROM bills WHERE goal_id = @GoalId AND user_id = @UserId);
                    ";
                    await conn.ExecuteAsync(deleteExpensesSql, new { GoalId = id, UserId = userId }, transaction);

                    // 2. Deletar todas as contas dessa meta
                    const string deleteBillsSql = "DELETE FROM bills WHERE goal_id = @GoalId AND user_id = @UserId;";
                    await conn.ExecuteAsync(deleteBillsSql, new { GoalId = id, UserId = userId }, transaction);
                }
                else
                {
                    // 1. Deletar apenas contas que NÃO foram pagas (pendentes/atrasadas) vinculadas à meta
                    const string deletePendingBillsSql = "DELETE FROM bills WHERE goal_id = @GoalId AND status != 'Pago' AND user_id = @UserId;";
                    await conn.ExecuteAsync(deletePendingBillsSql, new { GoalId = id, UserId = userId }, transaction);

                    // 2. Desvincular as contas PAGAS (histórico de depósitos) definindo goal_id = NULL
                    const string updatePaidBillsSql = "UPDATE bills SET goal_id = NULL WHERE goal_id = @GoalId AND user_id = @UserId;";
                    await conn.ExecuteAsync(updatePaidBillsSql, new { GoalId = id, UserId = userId }, transaction);
                }

                // 3. Deletar a meta
                const string deleteGoalSql = "DELETE FROM goals WHERE id = @GoalId AND user_id = @UserId;";
                await conn.ExecuteAsync(deleteGoalSql, new { GoalId = id, UserId = userId }, transaction);

                await transaction.CommitAsync();
            }
            catch
            {
                await transaction.RollbackAsync();
                throw;
            }
        }

        public async Task<IEnumerable<GoalHistoryDto>> GetGoalHistoryAsync(Guid userId, Guid goalId)
        {
            const string sql = @"
                SELECT 
                    e.amount AS ""Amount"",
                    e.date   AS ""Date"",
                    e.name   AS ""Name""
                FROM expenses e
                JOIN bills b ON e.bill_id = b.id
                WHERE b.goal_id = @GoalId AND b.user_id = @UserId
                ORDER BY e.date DESC;
            ";

            await using var conn = new NpgsqlConnection(_connectionString);
            return await conn.QueryAsync<GoalHistoryDto>(sql, new { GoalId = goalId, UserId = userId });
        }
    }
}