using System.Security.Cryptography;
using System.Text;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Options;
using sauraav_portfolio_site.Models;

namespace sauraav_portfolio_site.Services.Auth;

/// <summary>
/// Verifies credentials from <see cref="AdminOptions"/>. Prefers a PBKDF2 hash; falls back to a
/// constant-time comparison against a plaintext password for migration.
/// </summary>
public sealed class ConfiguredAdminCredentialVerifier : IAdminCredentialVerifier
{
    private static readonly Action<ILogger, Exception?> LogPlaintextPassword = LoggerMessage.Define(
        LogLevel.Warning,
        new EventId(1, "PlaintextAdminPassword"),
        "Admin:Password is set in plaintext. Generate a hash with 'dotnet run -- hash-password' and set Admin:PasswordHash instead");

    private readonly AdminOptions _options;
    private readonly PasswordHasher<AdminOptions> _hasher = new();

    public ConfiguredAdminCredentialVerifier(IOptions<AdminOptions> options, ILogger<ConfiguredAdminCredentialVerifier> logger)
    {
        ArgumentNullException.ThrowIfNull(options);
        _options = options.Value;

        if (!_options.HasHashedPassword && _options.HasPlaintextPassword)
        {
            LogPlaintextPassword(logger, null);
        }

        CredentialVersion = ComputeVersion(_options);
    }

    public string CredentialVersion { get; }

    public bool Verify(string? username, string? password)
    {
        if (username is null || password is null)
        {
            return false;
        }

        // Evaluate both checks so the response time does not reveal which one failed.
        var usernameMatches = FixedTimeEquals(username, _options.Username);
        var passwordMatches = VerifyPassword(password);
        return usernameMatches & passwordMatches;
    }

    private bool VerifyPassword(string password)
    {
        if (_options.HasHashedPassword)
        {
            return _hasher.VerifyHashedPassword(_options, _options.PasswordHash!, password) != PasswordVerificationResult.Failed;
        }

        return _options.HasPlaintextPassword && FixedTimeEquals(password, _options.Password!);
    }

    private static bool FixedTimeEquals(string left, string right)
    {
        var leftBytes = Encoding.UTF8.GetBytes(left);
        var rightBytes = Encoding.UTF8.GetBytes(right);
        return leftBytes.Length == rightBytes.Length && CryptographicOperations.FixedTimeEquals(leftBytes, rightBytes);
    }

    private static string ComputeVersion(AdminOptions options)
    {
        var secret = options.HasHashedPassword ? options.PasswordHash! : options.Password ?? string.Empty;
        var digest = SHA256.HashData(Encoding.UTF8.GetBytes($"{options.Username}\n{secret}"));
        return Convert.ToHexString(digest.AsSpan(0, 8));
    }
}
