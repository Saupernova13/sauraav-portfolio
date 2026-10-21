using System.ComponentModel.DataAnnotations;

namespace sauraav_portfolio_site.Models;

/// <summary>Credentials for the single admin account.</summary>
public sealed class AdminOptions
{
    public const string SectionName = "Admin";

    [Required]
    public string Username { get; set; } = string.Empty;

    /// <summary>
    /// PBKDF2 hash produced by <c>dotnet run -- hash-password</c>. Preferred over <see cref="Password"/>.
    /// </summary>
    public string? PasswordHash { get; set; }

    /// <summary>Legacy plaintext password. Supported for migration only; a warning is logged at startup.</summary>
    public string? Password { get; set; }

    public bool HasHashedPassword => !string.IsNullOrWhiteSpace(PasswordHash);

    public bool HasPlaintextPassword => !string.IsNullOrEmpty(Password);
}
