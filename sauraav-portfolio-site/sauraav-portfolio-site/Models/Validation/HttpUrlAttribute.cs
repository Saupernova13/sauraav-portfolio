using System.ComponentModel.DataAnnotations;

namespace sauraav_portfolio_site.Models.Validation;

/// <summary>Accepts empty values or absolute http(s) URLs. Rejects other schemes such as javascript:.</summary>
[AttributeUsage(AttributeTargets.Property)]
public sealed class HttpUrlAttribute : ValidationAttribute
{
    public HttpUrlAttribute() : base("The {0} field must be an absolute http or https URL.")
    {
    }

    public override bool IsValid(object? value)
    {
        if (value is not string text || string.IsNullOrWhiteSpace(text))
        {
            return true;
        }

        return Uri.TryCreate(text, UriKind.Absolute, out var uri)
            && (uri.Scheme == Uri.UriSchemeHttp || uri.Scheme == Uri.UriSchemeHttps);
    }
}
