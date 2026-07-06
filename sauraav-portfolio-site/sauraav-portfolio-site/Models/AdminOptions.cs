using System.ComponentModel.DataAnnotations;

namespace sauraav_portfolio_site.Models;

public sealed class AdminOptions
{
    [Required] public string Username { get; set; } = string.Empty;

    /// <summary>Plaintext password. Deprecated — prefer <see cref="PasswordHash"/>.</summary>
    public string Password { get; set; } = string.Empty;

    /// <summary>PBKDF2 hash produced by: dotnet run -- hash-password "your-password"</summary>
    public string PasswordHash { get; set; } = string.Empty;
}
