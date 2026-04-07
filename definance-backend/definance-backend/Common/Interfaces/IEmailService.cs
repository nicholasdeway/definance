using System.Threading.Tasks;

namespace definance_backend.Common.Interfaces
{
    public interface IEmailService
    {
        Task SendPasswordResetEmailAsync(string toEmail, string resetLink, string userName, string token);
    }
}