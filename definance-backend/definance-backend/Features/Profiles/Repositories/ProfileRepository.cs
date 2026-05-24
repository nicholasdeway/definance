using definance_backend.Domain.Entities;
using Npgsql;
using Dapper;

namespace definance_backend.Features.Profiles.Repositories
{
    public class ProfileRepository : IProfileRepository
    {
        private readonly string _connectionString;

        public ProfileRepository(IConfiguration configuration)
        {
            _connectionString = configuration.GetConnectionString("DefaultConnection")!;
        }

        public async Task<User?> GetByIdAsync(Guid userId)
        {
            const string sql = @"
                SELECT
                    id,
                    first_name             AS ""FirstName"",
                    last_name              AS ""LastName"",
                    email,
                    password,
                    password_reset_pending AS ""PasswordResetPending"",
                    phone,
                    auth_provider          AS ""AuthProvider"",
                    provider_user_id       AS ""ProviderUserId"",
                    provider_email         AS ""ProviderEmail"",
                    picture_url            AS ""PictureUrl"",
                    created_at             AS ""CreatedAt"",
                    updated_at             AS ""UpdatedAt"",
                    is_active              AS ""IsActive"",
                    has_completed_onboarding AS ""HasCompletedOnboarding"",
                    onboarding_data         AS ""OnboardingData"",
                    plan_type              AS ""PlanType"",
                    premium_until          AS ""PremiumUntil"",
                    stripe_customer_id     AS ""StripeCustomerId"",
                    stripe_subscription_id AS ""StripeSubscriptionId"",
                    subscription_status    AS ""SubscriptionStatus""
                FROM users
                WHERE id = @Id;
            ";

            await using var conn = new NpgsqlConnection(_connectionString);
            return await conn.QueryFirstOrDefaultAsync<User>(sql, new { Id = userId });
        }

        public async Task<User?> GetByEmailAsync(string email)
        {
            const string sql = @"
                SELECT
                    id,
                    first_name             AS ""FirstName"",
                    last_name              AS ""LastName"",
                    email,
                    password,
                    password_reset_pending AS ""PasswordResetPending"",
                    phone,
                    auth_provider          AS ""AuthProvider"",
                    provider_user_id       AS ""ProviderUserId"",
                    provider_email         AS ""ProviderEmail"",
                    picture_url            AS ""PictureUrl"",
                    created_at             AS ""CreatedAt"",
                    updated_at             AS ""UpdatedAt"",
                    is_active              AS ""IsActive"",
                    has_completed_onboarding AS ""HasCompletedOnboarding"",
                    onboarding_data         AS ""OnboardingData"",
                    plan_type              AS ""PlanType"",
                    premium_until          AS ""PremiumUntil"",
                    stripe_customer_id     AS ""StripeCustomerId"",
                    stripe_subscription_id AS ""StripeSubscriptionId"",
                    subscription_status    AS ""SubscriptionStatus""
                FROM users
                WHERE email = @Email;
            ";

            await using var conn = new NpgsqlConnection(_connectionString);
            return await conn.QueryFirstOrDefaultAsync<User>(sql, new { Email = email });
        }

        public async Task<User?> GetByPhoneAsync(string phone)
        {
            const string sql = @"
                SELECT
                    id,
                    first_name             AS ""FirstName"",
                    last_name              AS ""LastName"",
                    email,
                    password,
                    password_reset_pending AS ""PasswordResetPending"",
                    phone,
                    auth_provider          AS ""AuthProvider"",
                    provider_user_id       AS ""ProviderUserId"",
                    provider_email         AS ""ProviderEmail"",
                    picture_url            AS ""PictureUrl"",
                    created_at             AS ""CreatedAt"",
                    updated_at             AS ""UpdatedAt"",
                    is_active              AS ""IsActive"",
                    has_completed_onboarding AS ""HasCompletedOnboarding"",
                    onboarding_data         AS ""OnboardingData"",
                    plan_type              AS ""PlanType"",
                    premium_until          AS ""PremiumUntil"",
                    stripe_customer_id     AS ""StripeCustomerId"",
                    stripe_subscription_id AS ""StripeSubscriptionId"",
                    subscription_status    AS ""SubscriptionStatus""
                FROM users
                WHERE (phone = @Phone OR phone = '+' || @Phone OR '+' || phone = @Phone) AND is_active = TRUE;
            ";

            await using var conn = new NpgsqlConnection(_connectionString);
            return await conn.QueryFirstOrDefaultAsync<User>(sql, new { Phone = phone });
        }

        public async Task UpdateAsync(User user)
        {
            const string sql = @"
                UPDATE users SET
                    first_name       = @FirstName,
                    last_name        = @LastName,
                    email            = @Email,
                    password         = @Password,
                    phone            = @Phone,
                    auth_provider    = @AuthProvider,
                    provider_user_id = @ProviderUserId,
                    provider_email   = @ProviderEmail,
                    picture_url      = @PictureUrl,
                    has_completed_onboarding = @HasCompletedOnboarding,
                    onboarding_data = @OnboardingData::jsonb,
                    plan_type        = @PlanType,
                    premium_until    = @PremiumUntil,
                    stripe_customer_id = @StripeCustomerId,
                    stripe_subscription_id = @StripeSubscriptionId,
                    subscription_status = @SubscriptionStatus,
                    updated_at       = NOW(),
                    is_active        = @IsActive
                WHERE id = @Id;
            ";

            await using var conn = new NpgsqlConnection(_connectionString);
            await conn.ExecuteAsync(sql, user);
        }

        public async Task SoftDeleteAsync(Guid userId)
        {
            const string sql = @"
                DELETE FROM expenses WHERE user_id = @Id;
                DELETE FROM incomes WHERE user_id = @Id;
                DELETE FROM bills WHERE user_id = @Id;
                DELETE FROM goals WHERE user_id = @Id;
                DELETE FROM categories WHERE user_id = @Id AND is_system = FALSE;
                DELETE FROM ""WhatsAppPairings"" WHERE ""UserId"" = @Id;

                UPDATE users 
                SET 
                    is_active = FALSE,
                    has_completed_onboarding = FALSE,
                    onboarding_data = NULL,
                    phone = NULL,
                    is_whatsapp_connected = FALSE,
                    subscription_status = 'canceled',
                    picture_url = NULL,
                    updated_at = NOW()
                WHERE id = @Id;
            ";

            await using var conn = new NpgsqlConnection(_connectionString);
            await conn.ExecuteAsync(sql, new { Id = userId });
        }

        public async Task PurgeDataAsync(Guid userId, string dataType)
        {
            string sql = dataType switch
            {
                "incomes" => "DELETE FROM incomes WHERE user_id = @Id;",
                "expenses" => "DELETE FROM expenses WHERE user_id = @Id;",
                "history" => "DELETE FROM incomes WHERE user_id = @Id; DELETE FROM expenses WHERE user_id = @Id;",
                "daily-expenses" => "DELETE FROM expenses WHERE user_id = @Id AND expense_type = 'Variável';",
                "bills" => "UPDATE expenses SET bill_id = NULL WHERE user_id = @Id; DELETE FROM bills WHERE user_id = @Id;",
                "goals" => "UPDATE bills SET goal_id = NULL WHERE user_id = @Id; DELETE FROM goals WHERE user_id = @Id;",
                "categories" => "DELETE FROM categories WHERE user_id = @Id AND is_system = FALSE;",
                _ => throw new ArgumentException("Invalid data type", nameof(dataType))
            };

            await using var conn = new NpgsqlConnection(_connectionString);
            await conn.ExecuteAsync(sql, new { Id = userId });
        }
    }
}