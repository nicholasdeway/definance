using System.Threading.Tasks;
using Dapper;
using Microsoft.Extensions.Configuration;
using Npgsql;

namespace definance_backend.Features.Subscriptions.Repositories
{
    public class WebhookEventRepository : IWebhookEventRepository
    {
        private readonly string _connectionString;

        public WebhookEventRepository(IConfiguration configuration)
        {
            _connectionString = configuration.GetConnectionString("DefaultConnection")
                ?? throw new ApplicationException("Connection string 'DefaultConnection' não configurada.");
        }

        public async Task<bool> IsAlreadyProcessedAsync(string gateway, string eventId)
        {
            const string sql = @"
                SELECT COUNT(1)
                FROM processed_webhook_events
                WHERE gateway  = @Gateway
                  AND event_id = @EventId;
            ";

            await using var connection = new NpgsqlConnection(_connectionString);
            var count = await connection.ExecuteScalarAsync<int>(sql, new { Gateway = gateway, EventId = eventId });
            return count > 0;
        }

        public async Task MarkAsProcessedAsync(string gateway, string eventId)
        {
            // ON CONFLICT DO NOTHING garante que a operação seja idempotente:
            // se o mesmo evento tentar ser inserido duas vezes em paralelo, apenas um vence.
            const string sql = @"
                INSERT INTO processed_webhook_events (gateway, event_id)
                VALUES (@Gateway, @EventId)
                ON CONFLICT (gateway, event_id) DO NOTHING;
            ";

            await using var connection = new NpgsqlConnection(_connectionString);
            await connection.ExecuteAsync(sql, new { Gateway = gateway, EventId = eventId });
        }
    }
}