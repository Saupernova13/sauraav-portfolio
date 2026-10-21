using System.Buffers;

namespace sauraav_portfolio_site.Services.Sections;

/// <summary>Derives a Firebase-safe storage key from an entry's display name.</summary>
public static class PortfolioKey
{
    public const int MaxLength = 200;

    private static readonly SearchValues<char> InvalidChars = SearchValues.Create("/.#$[]");

    /// <summary>
    /// Produces a key, or returns <see langword="false"/> when the name is blank or too long.
    /// A blank key would address the whole section node, so it is never allowed.
    /// </summary>
    public static bool TryCreate(string? name, out string key)
    {
        key = string.Empty;
        if (string.IsNullOrWhiteSpace(name))
        {
            return false;
        }

        var trimmed = name.Trim();
        if (trimmed.Length > MaxLength)
        {
            return false;
        }

        key = string.Create(trimmed.Length, trimmed, static (span, source) =>
        {
            for (var i = 0; i < source.Length; i++)
            {
                var c = source[i];
                span[i] = InvalidChars.Contains(c) || char.IsControl(c) ? '_' : c;
            }
        });

        return true;
    }

    /// <summary>Returns the key for a name known to be valid.</summary>
    public static string Create(string name) =>
        TryCreate(name, out var key) ? key : throw new ArgumentException("Name does not produce a valid key.", nameof(name));

    /// <summary>Checks that a key supplied by a client is one this class could have produced.</summary>
    public static bool IsValid(string? key) =>
        !string.IsNullOrWhiteSpace(key)
        && key.Length <= MaxLength
        && key.AsSpan().IndexOfAny(InvalidChars) < 0
        && !key.Any(char.IsControl);
}
