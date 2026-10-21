using System.ComponentModel.DataAnnotations;

namespace sauraav_portfolio_site.Models.Validation;

/// <summary>
/// Accepts empty values, a <c>data:image/...;base64,</c> URI or raw base64, up to a byte budget.
/// </summary>
[AttributeUsage(AttributeTargets.Property)]
public sealed class ImageDataAttribute : ValidationAttribute
{
    /// <summary>Roughly 2 MB of encoded data.</summary>
    public const int DefaultMaxLength = 2_800_000;

    private static readonly string[] AllowedPrefixes =
    [
        "data:image/png;base64,",
        "data:image/jpeg;base64,",
        "data:image/jpg;base64,",
        "data:image/webp;base64,",
        "data:image/gif;base64,",
    ];

    public ImageDataAttribute() : base("The {0} field must be a PNG, JPEG, WebP or GIF image under 2 MB.")
    {
    }

    public int MaxLength { get; init; } = DefaultMaxLength;

    public override bool IsValid(object? value)
    {
        if (value is not string text || string.IsNullOrWhiteSpace(text))
        {
            return true;
        }

        if (text.Length > MaxLength)
        {
            return false;
        }

        var payload = text.AsSpan().Trim();
        var comma = payload.IndexOf(',');
        if (comma >= 0)
        {
            var prefix = payload[..(comma + 1)].ToString();
            if (!AllowedPrefixes.Contains(prefix, StringComparer.OrdinalIgnoreCase))
            {
                return false;
            }

            payload = payload[(comma + 1)..];
        }

        return Convert.TryFromBase64Chars(payload, new byte[payload.Length], out _);
    }
}
