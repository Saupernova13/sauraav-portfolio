using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Logging.Abstractions;
using Microsoft.Extensions.Options;
using sauraav_portfolio_site.Models;
using sauraav_portfolio_site.Services.Auth;

namespace sauraav_portfolio_site.Tests.Auth;

public sealed class ConfiguredAdminCredentialVerifierTests
{
    private static ConfiguredAdminCredentialVerifier Create(AdminOptions options) =>
        new(Options.Create(options), NullLogger<ConfiguredAdminCredentialVerifier>.Instance);

    [Fact]
    public void Verify_accepts_matching_hashed_password()
    {
        var hash = new PasswordHasher<AdminOptions>().HashPassword(new AdminOptions(), "correct horse battery staple");
        var verifier = Create(new AdminOptions { Username = "admin", PasswordHash = hash });

        Assert.True(verifier.Verify("admin", "correct horse battery staple"));
        Assert.False(verifier.Verify("admin", "wrong"));
        Assert.False(verifier.Verify("someone", "correct horse battery staple"));
    }

    [Fact]
    public void Verify_falls_back_to_plaintext_only_when_no_hash_is_configured()
    {
        var verifier = Create(new AdminOptions { Username = "admin", Password = "legacy" });

        Assert.True(verifier.Verify("admin", "legacy"));
        Assert.False(verifier.Verify("admin", "legacy "));
        Assert.False(verifier.Verify("Admin", "legacy"));
    }

    [Fact]
    public void Verify_rejects_nulls_and_empty_configuration()
    {
        var verifier = Create(new AdminOptions { Username = "admin" });

        Assert.False(verifier.Verify("admin", string.Empty));
        Assert.False(verifier.Verify(null, "x"));
        Assert.False(verifier.Verify("admin", null));
    }

    [Fact]
    public void CredentialVersion_changes_when_the_secret_changes()
    {
        var first = Create(new AdminOptions { Username = "admin", Password = "one" }).CredentialVersion;
        var same = Create(new AdminOptions { Username = "admin", Password = "one" }).CredentialVersion;
        var rotated = Create(new AdminOptions { Username = "admin", Password = "two" }).CredentialVersion;

        Assert.Equal(first, same);
        Assert.NotEqual(first, rotated);
    }

    [Fact]
    public void Validator_requires_a_username_and_some_password()
    {
        var validator = new AdminOptionsValidator();

        Assert.True(validator.Validate(null, new AdminOptions { Username = "admin", Password = "x" }).Succeeded);
        Assert.True(validator.Validate(null, new AdminOptions { Username = "admin", PasswordHash = "h" }).Succeeded);
        Assert.True(validator.Validate(null, new AdminOptions { Username = string.Empty, Password = "x" }).Failed);
        Assert.True(validator.Validate(null, new AdminOptions { Username = "admin" }).Failed);
    }
}
