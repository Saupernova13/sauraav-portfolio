using System.Text;

namespace sauraav_portfolio_site.Services.Media;

/// <summary>What the site accepts as a demo video: MP4 or WebM, checked by signature, up to a fixed size.</summary>
public static class VideoUploadPolicy
{
    public const long MaxBytes = 100L * 1024 * 1024;

    public const int SignatureLength = 12;

    private static readonly byte[] WebmSignature = [0x1A, 0x45, 0xDF, 0xA3];
    private static readonly byte[] Mp4Marker = Encoding.ASCII.GetBytes("ftyp");

    /// <summary>Returns the extension to store the file under, or <see langword="null"/> if the signature is unknown.</summary>
    public static string? DetectExtension(ReadOnlySpan<byte> signature)
    {
        if (signature.StartsWith(WebmSignature))
        {
            return ".webm";
        }

        if (signature.Length >= 8 && signature.Slice(4, 4).SequenceEqual(Mp4Marker))
        {
            return ".mp4";
        }

        return null;
    }

    public static bool IsAcceptableContentType(string? contentType) =>
        contentType is not null && contentType.StartsWith("video/", StringComparison.OrdinalIgnoreCase);
}
