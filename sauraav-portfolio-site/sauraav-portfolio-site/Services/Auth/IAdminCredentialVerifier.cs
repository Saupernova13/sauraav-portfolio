namespace sauraav_portfolio_site.Services.Auth;

/// <summary>Checks a login attempt against the configured admin account.</summary>
public interface IAdminCredentialVerifier
{
    bool Verify(string? username, string? password);

    /// <summary>
    /// Opaque value that changes whenever the configured credentials change. Stored in the auth
    /// cookie so existing sessions end after a password rotation.
    /// </summary>
    string CredentialVersion { get; }
}
