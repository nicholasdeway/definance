namespace definance_backend.Features.Profiles.DTOs
{
    public class DeleteAccountRequest
    {
        public string? CurrentPassword { get; set; }
        public string? Reason { get; set; }
        public bool IsGoogleAccount { get; set; }
    }
}