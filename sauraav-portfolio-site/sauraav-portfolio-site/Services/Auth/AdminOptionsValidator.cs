using Microsoft.Extensions.Options;
using sauraav_portfolio_site.Models;

namespace sauraav_portfolio_site.Services.Auth;

/// <summary>Fails startup when the admin account is unusable, instead of accepting blank credentials.</summary>
public sealed class AdminOptionsValidator : IValidateOptions<AdminOptions>
{
    public ValidateOptionsResult Validate(string? name, AdminOptions options)
    {
        ArgumentNullException.ThrowIfNull(options);

        if (string.IsNullOrWhiteSpace(options.Username))
        {
            return ValidateOptionsResult.Fail("Admin:Username is required.");
        }

        if (!options.HasHashedPassword && !options.HasPlaintextPassword)
        {
            return ValidateOptionsResult.Fail("Set Admin:PasswordHash (preferred, see 'dotnet run -- hash-password') or Admin:Password.");
        }

        return ValidateOptionsResult.Success;
    }
}
