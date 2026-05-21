using System.Threading.Tasks;
using definance_backend.Features.WhatsApp.DTOs;
using definance_backend.Domain.Entities;

namespace definance_backend.Features.WhatsApp.Services
{
    public interface IWhatsAppService
    {
        Task<WhatsAppPairingResponseDto> GeneratePairingCodeAsync(Guid userId);
        Task<WhatsAppPairingResponseDto> GetPairingStatusAsync(Guid userId);
        Task HandleTwilioWebhookAsync(string fromPhone, string body);
        Task<User?> GetUserByIdAsync(Guid userId);
    }
}