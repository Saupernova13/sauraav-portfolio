using Microsoft.AspNetCore.Mvc.ModelBinding;

namespace sauraav_portfolio_site.Controllers;

/// <summary>Uniform JSON envelope for the admin endpoints.</summary>
public sealed record ApiResponse(bool Success, string? Message, string? Key, IReadOnlyDictionary<string, string[]>? Errors)
{
    public static ApiResponse Ok(string? key = null) => new(true, null, key, null);

    public static ApiResponse Fail(string message, IReadOnlyDictionary<string, string[]>? errors = null) =>
        new(false, message, null, errors);

    public static ApiResponse Invalid(ModelStateDictionary modelState)
    {
        ArgumentNullException.ThrowIfNull(modelState);

        var errors = modelState
            .Where(e => e.Value is { Errors.Count: > 0 })
            .ToDictionary(
                e => e.Key,
                e => e.Value!.Errors.Select(x => x.ErrorMessage).ToArray(),
                StringComparer.Ordinal);

        return Fail("Please fix the highlighted fields.", errors);
    }
}
