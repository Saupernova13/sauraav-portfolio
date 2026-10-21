using Microsoft.AspNetCore.Identity;
using sauraav_portfolio_site.Models;

namespace sauraav_portfolio_site.Tools;

/// <summary>
/// <c>dotnet run -- hash-password</c>: reads a password from standard input and prints the hash to
/// store in <c>Admin:PasswordHash</c>. Reading from stdin keeps the password out of shell history.
/// </summary>
public static class PasswordHashCommand
{
    public const string Name = "hash-password";

    public static async Task<int> RunAsync(TextReader input, TextWriter output, TextWriter error)
    {
        ArgumentNullException.ThrowIfNull(input);
        ArgumentNullException.ThrowIfNull(output);
        ArgumentNullException.ThrowIfNull(error);

        var password = (await input.ReadLineAsync())?.TrimEnd('\r', '\n');
        if (string.IsNullOrEmpty(password))
        {
            await error.WriteLineAsync("Provide the password on standard input, e.g.: echo <password> | dotnet run -- hash-password");
            return 1;
        }

        var hasher = new PasswordHasher<AdminOptions>();
        await output.WriteLineAsync(hasher.HashPassword(new AdminOptions(), password));
        return 0;
    }
}
