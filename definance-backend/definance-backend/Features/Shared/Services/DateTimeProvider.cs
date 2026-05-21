using Microsoft.Extensions.Configuration;
using System.Runtime.InteropServices;

namespace definance_backend.Features.Shared.Services
{
    public class DateTimeProvider : IDateTimeProvider
    {
        public TimeZoneInfo AppTimeZone { get; }

        public DateTimeProvider(IConfiguration configuration)
        {
            var timezoneId = configuration["AppSettings:TimeZone"];
            
            if (!string.IsNullOrEmpty(timezoneId))
            {
                try 
                { 
                    AppTimeZone = TimeZoneInfo.FindSystemTimeZoneById(timezoneId);
                    return;
                }
                catch (TimeZoneNotFoundException ex)
                {
                    throw new InvalidOperationException(
                        $"Timezone '{timezoneId}' não encontrado no sistema.", ex);
                }
            }
            
            // Fallback automático
            AppTimeZone = RuntimeInformation.IsOSPlatform(OSPlatform.Windows)
                ? TimeZoneInfo.FindSystemTimeZoneById("E. South America Standard Time")
                : TimeZoneInfo.FindSystemTimeZoneById("America/Sao_Paulo");
        }

        public DateTime NormalizeToAppDate(DateTime date)
        {
            if (date == default)
                return GetCurrentAppDate();
            
            DateTime appTime;

            if (date.Kind == DateTimeKind.Unspecified)
            {
                // Se não tem timezone, assumimos que já é o dia correto desejado
                appTime = date;
            }
            else
            {
                // Converte para UTC se necessário e descobre o horário na aplicação
                DateTime utcDate = date.Kind == DateTimeKind.Utc 
                    ? date 
                    : date.ToUniversalTime();
                
                appTime = TimeZoneInfo.ConvertTimeFromUtc(utcDate, AppTimeZone);
            }
            
            // Fixa a hora em 00:00 local. Isso retorna a data perfeitamente meia-noite
            // na perspectiva do usuário (no banco e frontend ficará 00:00 sem offset)
            var localMidnight = new DateTime(appTime.Year, appTime.Month, appTime.Day, 0, 0, 0);
            return DateTime.SpecifyKind(localMidnight, DateTimeKind.Unspecified);
        }

        public DateTime GetCurrentAppDate()
        {
            return NormalizeToAppDate(DateTime.UtcNow);
        }

        public DateTime GetExactAppDateTime()
        {
            DateTime utcNow = DateTime.UtcNow;
            DateTime appTime = TimeZoneInfo.ConvertTimeFromUtc(utcNow, AppTimeZone);
            return DateTime.SpecifyKind(new DateTime(appTime.Year, appTime.Month, appTime.Day, appTime.Hour, appTime.Minute, appTime.Second), DateTimeKind.Unspecified);
        }

        public DateTime PreserveExactAppDateTime(DateTime date)
        {
            if (date == default) return GetExactAppDateTime();

            if (date.Kind == DateTimeKind.Unspecified)
                return date; // Assumimos que o frontend mandou certo
            
            DateTime utcDate = date.Kind == DateTimeKind.Utc 
                ? date 
                : date.ToUniversalTime();
                
            DateTime appTime = TimeZoneInfo.ConvertTimeFromUtc(utcDate, AppTimeZone);
            return DateTime.SpecifyKind(appTime, DateTimeKind.Unspecified);
        }
    }
}