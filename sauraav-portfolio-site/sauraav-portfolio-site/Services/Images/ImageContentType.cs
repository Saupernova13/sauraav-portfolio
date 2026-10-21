namespace sauraav_portfolio_site.Services.Images;

/// <summary>Detects an image's MIME type from its leading bytes.</summary>
public static class ImageContentType
{
    private static readonly byte[] Png = [0x89, 0x50, 0x4E, 0x47];
    private static readonly byte[] Jpeg = [0xFF, 0xD8, 0xFF];
    private static readonly byte[] Gif = [0x47, 0x49, 0x46, 0x38];
    private static readonly byte[] Riff = [0x52, 0x49, 0x46, 0x46];
    private static readonly byte[] Webp = [0x57, 0x45, 0x42, 0x50];

    /// <summary>Returns the detected type, or <see langword="null"/> when the bytes are not a supported image.</summary>
    public static string? Detect(ReadOnlySpan<byte> bytes)
    {
        if (bytes.StartsWith(Png))
        {
            return "image/png";
        }

        if (bytes.StartsWith(Jpeg))
        {
            return "image/jpeg";
        }

        if (bytes.StartsWith(Gif))
        {
            return "image/gif";
        }

        if (bytes.Length >= 12 && bytes.StartsWith(Riff) && bytes.Slice(8, 4).SequenceEqual(Webp))
        {
            return "image/webp";
        }

        return null;
    }
}
