using definance_backend.Domain.Entities;

namespace definance_backend.Features.WhatsApp.Repositories
{
    public interface IWhatsAppRepository
    {
        Task<WhatsAppPairing?> GetPairingByCodeAsync(string code);
        Task<WhatsAppPairing?> GetActivePairingByUserIdAsync(Guid userId);
        Task<WhatsAppPairing> CreatePairingAsync(WhatsAppPairing pairing);
        Task UpdatePairingAsync(WhatsAppPairing pairing);
        
        Task<User?> GetUserByPhoneAsync(string phone);
        Task<User?> GetUserByIdAsync(Guid userId);
        Task UpdateUserPhoneAsync(Guid userId, string phone);
    }
}