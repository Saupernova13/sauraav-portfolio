namespace sauraav_portfolio_site.Services.Images;

public sealed class Base64ImageSanitizer : IImageDataSanitizer
{
    private static readonly Action<ILogger, Exception?> LogInvalidBase64 =
        LoggerMessage.Define(LogLevel.Warning, new EventId(1, "InvalidBase64"), "Invalid base64 image data discarded");

    private readonly ILogger<Base64ImageSanitizer> _logger;

    public Base64ImageSanitizer(ILogger<Base64ImageSanitizer> logger) => _logger = logger;

    public string? Clean(string? value)
    {
        if (string.IsNullOrWhiteSpace(value))
        {
            return null;
        }

        var span = value.AsSpan().Trim();
        var comma = span.IndexOf(',');
        if (comma >= 0)
        {
            span = span[(comma + 1)..];
        }

        var cleaned = span.ToString()
            .Replace("\n", string.Empty, StringComparison.Ordinal)
            .Replace("\r", string.Empty, StringComparison.Ordinal)
            .Replace(" ", string.Empty, StringComparison.Ordinal);

        if (cleaned.Length == 0)
        {
            return null;
        }

        if (Convert.TryFromBase64String(cleaned, new byte[cleaned.Length], out _))
        {
            return cleaned;
        }

        LogInvalidBase64(_logger, null);
        return null;
    }
}
