using System;
using System.Threading.Tasks;
using Dapper;
using definance_backend.Domain.Entities;
using Microsoft.Extensions.Configuration;
using Npgsql;

namespace definance_backend.Features.Auth.Repositories
{
    public class UserRepository : IUserRepository
    {
        private readonly string _connectionString;

        public UserRepository(IConfiguration configuration)
        {
            _connectionString = configuration.GetConnectionString("DefaultConnection")
                ?? throw new ApplicationException("Connection string 'DefaultConnection' não configurada.");
        }

        // GET BY EMAIL
        public async Task<User?> GetByEmailAsync(string email)
        {
            const string sql = @"
                SELECT
                    id                      AS ""Id"",
                    first_name              AS ""FirstName"",
                    last_name               AS ""LastName"",
                    email                   AS ""Email"",
                    password                AS ""Password"",
                    password_reset_pending  AS ""PasswordResetPending"",
                    password_reset_token    AS ""PasswordResetToken"",
                    password_reset_expires_at AS ""PasswordResetExpiresAt"",
                    phone                   AS ""Phone"",
                    created_at              AS ""CreatedAt"",
                    updated_at              AS ""UpdatedAt"",
                    auth_provider           AS ""AuthProvider"",
                    provider_user_id        AS ""ProviderUserId"",
                    provider_email          AS ""ProviderEmail"",
                    picture_url             AS ""PictureUrl"",
                    last_login_at           AS ""LastLoginAt"",
                    failed_login_attempts   AS ""FailedLoginAttempts"",
                    lockout_end             AS ""LockoutEnd"",
                    is_active               AS ""IsActive"",
                    has_completed_onboarding AS ""HasCompletedOnboarding"",
                    is_whatsapp_connected   AS ""IsWhatsAppConnected"",
                    onboarding_data         AS ""OnboardingData"",
                    plan_type               AS ""PlanType"",
                    premium_until           AS ""PremiumUntil"",
                    stripe_customer_id      AS ""StripeCustomerId"",
                    stripe_subscription_id  AS ""StripeSubscriptionId"",
                    subscription_status     AS ""SubscriptionStatus"",
                    subscription_started_at AS ""SubscriptionStartedAt"",
                    mp_payer_id             AS ""MercadoPagoPayerId"",
                    mp_payment_id           AS ""MercadoPagoPaymentId""
                FROM users
                WHERE LOWER(email) = LOWER(@Email);
            ";

            await using var connection = new NpgsqlConnection(_connectionString);
            return await connection.QuerySingleOrDefaultAsync<User>(sql, new { Email = email });
        }

        // GET BY PHONE (somente ativos)
        public async Task<User?> GetByPhoneAsync(string phone)
        {
            const string sql = @"
                SELECT
                    id                      AS ""Id"",
                    first_name              AS ""FirstName"",
                    last_name               AS ""LastName"",
                    email                   AS ""Email"",
                    password                AS ""Password"",
                    password_reset_pending  AS ""PasswordResetPending"",
                    password_reset_token    AS ""PasswordResetToken"",
                    password_reset_expires_at AS ""PasswordResetExpiresAt"",
                    phone                   AS ""Phone"",
                    created_at              AS ""CreatedAt"",
                    updated_at              AS ""UpdatedAt"",
                    auth_provider           AS ""AuthProvider"",
                    provider_user_id        AS ""ProviderUserId"",
                    provider_email          AS ""ProviderEmail"",
                    picture_url             AS ""PictureUrl"",
                    last_login_at           AS ""LastLoginAt"",
                    failed_login_attempts   AS ""FailedLoginAttempts"",
                    lockout_end             AS ""LockoutEnd"",
                    is_active               AS ""IsActive"",
                    has_completed_onboarding AS ""HasCompletedOnboarding"",
                    is_whatsapp_connected   AS ""IsWhatsAppConnected"",
                    onboarding_data         AS ""OnboardingData"",
                    plan_type               AS ""PlanType"",
                    premium_until           AS ""PremiumUntil"",
                    stripe_customer_id      AS ""StripeCustomerId"",
                    stripe_subscription_id  AS ""StripeSubscriptionId"",
                    subscription_status     AS ""SubscriptionStatus"",
                    subscription_started_at AS ""SubscriptionStartedAt"",
                    mp_payer_id             AS ""MercadoPagoPayerId"",
                    mp_payment_id           AS ""MercadoPagoPaymentId""
                FROM users
                WHERE (phone = @Phone OR phone = '+' || @Phone OR '+' || phone = @Phone)
                  AND is_active = TRUE
                ORDER BY created_at DESC
                LIMIT 1;
            ";

            await using var connection = new NpgsqlConnection(_connectionString);
            return await connection.QuerySingleOrDefaultAsync<User>(sql, new { Phone = phone });
        }

        // CREATE USER
        public async Task<User> CreateAsync(User user)
        {
            const string sql = @"
                INSERT INTO users (
                    first_name,
                    last_name,
                    email,
                    password,
                    phone,
                    auth_provider,
                    provider_user_id,
                    provider_email,
                    picture_url,
                    password_reset_pending,
                    password_reset_token,
                    password_reset_expires_at,
                    failed_login_attempts,
                    lockout_end,
                    created_at,
                    last_login_at,
                    is_active,
                    has_completed_onboarding,
                    is_whatsapp_connected,
                    onboarding_data,
                    plan_type,
                    premium_until,
                    stripe_customer_id,
                    stripe_subscription_id,
                    subscription_status,
                    mp_payer_id,
                    mp_payment_id
                )
                VALUES (
                    @FirstName,
                    @LastName,
                    @Email,
                    @Password,
                    @Phone,
                    @AuthProvider,
                    @ProviderUserId,
                    @ProviderEmail,
                    @PictureUrl,
                    @PasswordResetPending,
                    @PasswordResetToken,
                    @PasswordResetExpiresAt,
                    @FailedLoginAttempts,
                    @LockoutEnd,
                    now(),
                    @LastLoginAt,
                    TRUE,
                    @HasCompletedOnboarding,
                    @IsWhatsAppConnected,
                    @OnboardingData::jsonb,
                    @PlanType,
                    @PremiumUntil,
                    @StripeCustomerId,
                    @StripeSubscriptionId,
                    @SubscriptionStatus,
                    @MercadoPagoPayerId,
                    @MercadoPagoPaymentId
                )
                RETURNING
                    id          AS ""Id"",
                    created_at  AS ""CreatedAt"",
                    updated_at  AS ""UpdatedAt"";
            ";

            await using var connection = new NpgsqlConnection(_connectionString);

            var result = await connection.QuerySingleAsync<User>(sql, new
            {
                user.FirstName,
                user.LastName,
                user.Email,
                user.Password,
                user.Phone,
                user.AuthProvider,
                user.ProviderUserId,
                user.ProviderEmail,
                user.PictureUrl,
                user.PasswordResetPending,
                user.PasswordResetToken,
                user.PasswordResetExpiresAt,
                user.FailedLoginAttempts,
                user.LockoutEnd,
                user.LastLoginAt,
                user.HasCompletedOnboarding,
                user.IsWhatsAppConnected,
                user.OnboardingData,
                user.PlanType,
                user.PremiumUntil,
                user.StripeCustomerId,
                user.StripeSubscriptionId,
                user.SubscriptionStatus,
                user.MercadoPagoPayerId,
                user.MercadoPagoPaymentId
            });

            user.Id = result.Id;
            user.CreatedAt = result.CreatedAt;
            user.UpdatedAt = result.UpdatedAt;
            user.IsActive = true;

            return user;
        }

        // UPDATE PASSWORD
        public async Task UpdatePasswordAsync(User user)
        {
            const string sql = @"
                UPDATE users
                SET password = @Password,
                    password_reset_pending = @PasswordResetPending,
                    updated_at = now()
                WHERE id = @Id;
            ";

            await using var connection = new NpgsqlConnection(_connectionString);

            await connection.ExecuteAsync(sql, new
            {
                user.Password,
                user.PasswordResetPending,
                user.Id
            });
        }

        // MARK RESET TOKEN AS PENDING
        public async Task MarkResetPendingAsync(Guid id)
        {
            const string sql = @"
                UPDATE users
                SET password_reset_pending = true,
                    updated_at = now()
                WHERE id = @Id;
            ";

            await using var connection = new NpgsqlConnection(_connectionString);

            await connection.ExecuteAsync(sql, new { Id = id });
        }

        // UPDATE USER (GOOGLE / DADOS GERAIS / LOGIN LOCAL / REATIVAÇÃO)
        public async Task<User> UpdateAsync(User user)
        {
            const string sql = @"
                UPDATE users
                SET 
                    first_name              = @FirstName,
                    last_name               = @LastName,
                    email                   = @Email,
                    password                = @Password,
                    phone                   = @Phone,
                    picture_url             = @PictureUrl,
                    auth_provider           = @AuthProvider,
                    provider_user_id        = @ProviderUserId,
                    provider_email          = @ProviderEmail,
                    last_login_at           = @LastLoginAt,
                    password_reset_pending  = @PasswordResetPending,
                    password_reset_token    = @PasswordResetToken,
                    password_reset_expires_at = @PasswordResetExpiresAt,
                    failed_login_attempts   = @FailedLoginAttempts,
                    lockout_end             = @LockoutEnd,
                    is_active               = @IsActive,
                    has_completed_onboarding = @HasCompletedOnboarding,
                    is_whatsapp_connected   = @IsWhatsAppConnected,
                    onboarding_data         = @OnboardingData::jsonb,
                    plan_type               = @PlanType,
                    premium_until           = @PremiumUntil,
                    stripe_customer_id      = @StripeCustomerId,
                    stripe_subscription_id  = @StripeSubscriptionId,
                    subscription_status     = @SubscriptionStatus,
                    subscription_started_at = @SubscriptionStartedAt,
                    mp_payer_id             = @MercadoPagoPayerId,
                    mp_payment_id           = @MercadoPagoPaymentId,
                    updated_at              = now()
                WHERE id = @Id;
            ";

            await using var connection = new NpgsqlConnection(_connectionString);

            await connection.ExecuteAsync(sql, new
            {
                user.Id,
                user.FirstName,
                user.LastName,
                user.Email,
                user.Password,
                user.Phone,
                user.PictureUrl,
                user.AuthProvider,
                user.ProviderUserId,
                user.ProviderEmail,
                user.LastLoginAt,
                user.PasswordResetPending,
                user.PasswordResetToken,
                user.PasswordResetExpiresAt,
                user.FailedLoginAttempts,
                user.LockoutEnd,
                user.IsActive,
                user.HasCompletedOnboarding,
                user.IsWhatsAppConnected,
                user.OnboardingData,
                user.PlanType,
                user.PremiumUntil,
                user.StripeCustomerId,
                user.StripeSubscriptionId,
                user.SubscriptionStatus,
                user.SubscriptionStartedAt,
                user.MercadoPagoPayerId,
                user.MercadoPagoPaymentId
            });

            return user;
        }

        // GET BY ID (somente ativos - uso em cenários de Auth)
        public async Task<User?> GetByIdAsync(Guid id)
        {
            const string sql = @"
                SELECT
                    id                      AS ""Id"",
                    first_name              AS ""FirstName"",
                    last_name               AS ""LastName"",
                    email                   AS ""Email"",
                    password                AS ""Password"",
                    password_reset_pending  AS ""PasswordResetPending"",
                    password_reset_token    AS ""PasswordResetToken"",
                    password_reset_expires_at AS ""PasswordResetExpiresAt"",
                    phone                   AS ""Phone"",
                    created_at              AS ""CreatedAt"",
                    updated_at              AS ""UpdatedAt"",
                    auth_provider           AS ""AuthProvider"",
                    provider_user_id        AS ""ProviderUserId"",
                    provider_email          AS ""ProviderEmail"",
                    picture_url             AS ""PictureUrl"",
                    last_login_at           AS ""LastLoginAt"",
                    failed_login_attempts   AS ""FailedLoginAttempts"",
                    lockout_end             AS ""LockoutEnd"",
                    is_active               AS ""IsActive"",
                    has_completed_onboarding AS ""HasCompletedOnboarding"",
                    is_whatsapp_connected   AS ""IsWhatsAppConnected"",
                    onboarding_data         AS ""OnboardingData"",
                    plan_type               AS ""PlanType"",
                    premium_until           AS ""PremiumUntil"",
                    stripe_customer_id      AS ""StripeCustomerId"",
                    stripe_subscription_id  AS ""StripeSubscriptionId"",
                    subscription_status     AS ""SubscriptionStatus"",
                    subscription_started_at AS ""SubscriptionStartedAt"",
                    mp_payer_id             AS ""MercadoPagoPayerId"",
                    mp_payment_id           AS ""MercadoPagoPaymentId""
                FROM users
                WHERE id = @Id
                  AND is_active = TRUE;
            ";

            await using var connection = new NpgsqlConnection(_connectionString);
            return await connection.QuerySingleOrDefaultAsync<User>(sql, new { Id = id });
        }
    }
}