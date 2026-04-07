namespace definance_backend.Common.Helpers
{
    public class ServiceResult<T>
    {
        public bool Success { get; set; }
        public T? Data { get; set; }
        public string? Errors { get; set; }

        private ServiceResult(bool success, T? data, string? errors)
        {
            Success = success;
            Data = data;
            Errors = errors;
        }

        public static ServiceResult<T> Ok(T data)
            => new ServiceResult<T>(true, data, null);

        public static ServiceResult<T> Fail(string errorMessage)
            => new ServiceResult<T>(false, default, errorMessage);
    }
}