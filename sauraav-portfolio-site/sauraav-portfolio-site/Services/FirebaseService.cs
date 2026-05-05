using Firebase.Database;
using Firebase.Database.Query;
using Microsoft.Extensions.Options;
using sauraav_portfolio_site.Models;

namespace sauraav_portfolio_site.Services;

public sealed class FirebaseOptions
{
    public string DatabaseUrl { get; set; } = string.Empty;
}

public sealed class FirebaseService : IFirebaseService, IDisposable
{
    private readonly FirebaseClient _client;
    private readonly ILogger<FirebaseService> _logger;

    private static readonly Action<ILogger, Exception?> LogInvalidBase64 =
        LoggerMessage.Define(LogLevel.Warning, new EventId(1, "InvalidBase64"), "Invalid base64 string discarded");

    public FirebaseService(IOptions<FirebaseOptions> options, ILogger<FirebaseService> logger)
    {
        _logger = logger;
        _client = new FirebaseClient(options.Value.DatabaseUrl);
    }

    public async Task<T> GetData<T>(string node)
    {
        var result = await _client.Child(node).OnceSingleAsync<T>();
        SanitizeBase64Fields(result);
        return result;
    }

    public async Task SetData<T>(string node, T data) =>
        await _client.Child(node).PutAsync(data);

    public async Task DeleteData(string node) =>
        await _client.Child(node).DeleteAsync();

    public void Dispose() => _client.Dispose();

    private void SanitizeBase64Fields(object? result)
    {
        switch (result)
        {
            case Dictionary<string, EducationModel> edu:
                foreach (var v in edu.Values) v.ImageBase64 = CleanBase64(v.ImageBase64);
                break;
            case Dictionary<string, WorkExperienceModel> exp:
                foreach (var v in exp.Values) v.ImageBase64 = CleanBase64(v.ImageBase64);
                break;
            case Dictionary<string, QualificationModel> qual:
                foreach (var v in qual.Values) v.ImageBase64 = CleanBase64(v.ImageBase64);
                break;
        }
    }

    private string? CleanBase64(string? value)
    {
        if (string.IsNullOrWhiteSpace(value))
            return null;

        var span = value.AsSpan().Trim();
        var commaIdx = span.IndexOf(',');
        if (commaIdx >= 0)
            span = span[(commaIdx + 1)..];

        var cleaned = span.ToString()
            .Replace("\n", string.Empty, StringComparison.Ordinal)
            .Replace("\r", string.Empty, StringComparison.Ordinal);

        if (Convert.TryFromBase64String(cleaned, new byte[cleaned.Length], out _))
            return cleaned;

        LogInvalidBase64(_logger, null);
        return null;
    }
}
