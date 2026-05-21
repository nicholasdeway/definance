namespace definance_backend.Features.Shared.Services
{
    public interface IDateTimeProvider
    {
        DateTime NormalizeToAppDate(DateTime date);
        DateTime GetCurrentAppDate();
        DateTime GetExactAppDateTime();
        DateTime PreserveExactAppDateTime(DateTime date);
        TimeZoneInfo AppTimeZone { get; }
    }
}