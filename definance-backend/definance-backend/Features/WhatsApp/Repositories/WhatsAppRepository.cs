using Dapper;
using System.Text.RegularExpressions;
using definance_backend.Domain.Entities;
using Npgsql;

namespace definance_backend.Features.WhatsApp.Repositories
{
    public class WhatsAppRepository : IWhatsAppRepository
    {
        private readonly NpgsqlConnection _connection;

        public WhatsAppRepository(NpgsqlConnection connection)
        {
            _connection = connection;
        }

        public async Task<WhatsAppPairing?> GetPairingByCodeAsync(string code)
        {
            const string query = @"
                SELECT * FROM ""WhatsAppPairings""
                WHERE ""Code"" = @Code;
            ";

            return await _connection.QuerySingleOrDefaultAsync<WhatsAppPairing>(query, new { Code = code });
        }

        public async Task<WhatsAppPairing?> GetActivePairingByUserIdAsync(Guid userId)
        {
            const string query = @"
                SELECT * FROM ""WhatsAppPairings""
                WHERE ""UserId"" = @UserId AND ""ExpiresAt"" > @Now AND (""Status"" = 'Pending' OR ""Status"" = 'Connected')
                ORDER BY ""CreatedAt"" DESC
                LIMIT 1;
            ";

            return await _connection.QueryFirstOrDefaultAsync<WhatsAppPairing>(query, new { UserId = userId, Now = DateTime.UtcNow });
        }

        public async Task<WhatsAppPairing> CreatePairingAsync(WhatsAppPairing pairing)
        {
            const string query = @"
                INSERT INTO ""WhatsAppPairings"" (""Id"", ""UserId"", ""Code"", ""Status"", ""ExpiresAt"", ""CreatedAt"")
                VALUES (@Id, @UserId, @Code, @Status, @ExpiresAt, @CreatedAt);
            ";

            await _connection.ExecuteAsync(query, pairing);
            return pairing;
        }

        public async Task UpdatePairingAsync(WhatsAppPairing pairing)
        {
            const string query = @"
                UPDATE ""WhatsAppPairings""
                SET ""Status"" = @Status
                WHERE ""Id"" = @Id;
            ";

            await _connection.ExecuteAsync(query, new { Status = pairing.Status, Id = pairing.Id });
        }

        public async Task<User?> GetUserByPhoneAsync(string phone)
        {
            // Normaliza para o padrão mundial E.164 (+DDI...)
            var digitsOnly = Regex.Replace(phone, @"\D", "");
            var normalizedPhone = "+" + digitsOnly;

            const string query = @"
                SELECT 
                    id AS ""Id"", 
                    email AS ""Email"", 
                    phone AS ""Phone"",
                    is_whatsapp_connected AS ""IsWhatsAppConnected"" 
                FROM users
                WHERE phone = @Phone 
                  AND is_whatsapp_connected = TRUE;
            ";

            return await _connection.QuerySingleOrDefaultAsync<User>(query, new { Phone = normalizedPhone });
        }

        public async Task UpdateUserPhoneAsync(Guid userId, string phone)
        {
            const string query = @"
                UPDATE users
                SET phone = @Phone, is_whatsapp_connected = TRUE
                WHERE id = @Id;
            ";

            await _connection.ExecuteAsync(query, new { Phone = phone, Id = userId });
        }

        public async Task<User?> GetUserByIdAsync(Guid userId)
        {
            const string query = @"
                SELECT 
                    id AS ""Id"", 
                    first_name AS ""FirstName"",
                    last_name AS ""LastName"",
                    email AS ""Email"", 
                    phone AS ""Phone"",
                    is_whatsapp_connected AS ""IsWhatsAppConnected"" 
                FROM users
                WHERE id = @Id;
            ";

            return await _connection.QuerySingleOrDefaultAsync<User>(query, new { Id = userId });
        }
    }
}