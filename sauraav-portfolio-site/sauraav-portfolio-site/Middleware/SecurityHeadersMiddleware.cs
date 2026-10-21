namespace sauraav_portfolio_site.Middleware;

/// <summary>Adds a strict Content-Security-Policy and the usual hardening headers to every response.</summary>
public sealed class SecurityHeadersMiddleware
{
    private readonly RequestDelegate _next;
    private readonly string _contentSecurityPolicy;

    public SecurityHeadersMiddleware(RequestDelegate next, IHostEnvironment environment)
    {
        ArgumentNullException.ThrowIfNull(environment);
        _next = next;
        _contentSecurityPolicy = BuildPolicy(environment.IsDevelopment());
    }

    public Task InvokeAsync(HttpContext context)
    {
        ArgumentNullException.ThrowIfNull(context);

        var headers = context.Response.Headers;
        headers["Content-Security-Policy"] = _contentSecurityPolicy;
        headers["X-Frame-Options"] = "SAMEORIGIN";
        headers["X-Content-Type-Options"] = "nosniff";
        headers["Referrer-Policy"] = "strict-origin-when-cross-origin";
        headers["Permissions-Policy"] = "camera=(), microphone=(), geolocation=(), payment=()";
        headers["Cross-Origin-Opener-Policy"] = "same-origin";

        return _next(context);
    }

    private static string BuildPolicy(bool isDevelopment)
    {
        // dotnet watch injects a same-origin browser-refresh script that talks over a websocket.
        var connect = isDevelopment ? "'self' ws: wss:" : "'self'";
        var upgrade = isDevelopment ? string.Empty : "; upgrade-insecure-requests";

        return string.Join("; ",
            "default-src 'self'",
            "script-src 'self'",
            "style-src 'self'",
            "img-src 'self' data: blob:",
            "media-src 'self' blob:",
            "font-src 'self'",
            $"connect-src {connect}",
            "object-src 'none'",
            "base-uri 'self'",
            "form-action 'self'",
            "frame-ancestors 'self'") + upgrade;
    }
}

public static class SecurityHeadersExtensions
{
    public static IApplicationBuilder UseSecurityHeaders(this IApplicationBuilder app) =>
        app.UseMiddleware<SecurityHeadersMiddleware>();
}
