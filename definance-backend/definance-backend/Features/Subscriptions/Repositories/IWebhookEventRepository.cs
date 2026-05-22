using System.Threading.Tasks;

namespace definance_backend.Features.Subscriptions.Repositories
{
    public interface IWebhookEventRepository
    {
        Task<bool> IsAlreadyProcessedAsync(string gateway, string eventId);
        Task MarkAsProcessedAsync(string gateway, string eventId);
    }
}