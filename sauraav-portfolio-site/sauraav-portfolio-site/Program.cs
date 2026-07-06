using System.Threading.RateLimiting;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.RateLimiting;
using sauraav_portfolio_site.Filters;
using sauraav_portfolio_site.Models;
using sauraav_portfolio_site.Services;

if (args is ["hash-password", var password])
{
    Console.WriteLine(PasswordHasher.Hash(password));
    return;
}

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddOptions<FirebaseOptions>()
    .Bind(builder.Configuration.GetSection("Firebase"))
    .Validate(o => !string.IsNullOrEmpty(o.DatabaseUrl), "Firebase:DatabaseUrl is required.")
    .ValidateOnStart();

builder.Services.AddOptions<AdminOptions>()
    .Bind(builder.Configuration.GetSection("Admin"))
    .Validate(o => !string.IsNullOrEmpty(o.Username), "Admin:Username is required.")
    .Validate(o => !string.IsNullOrEmpty(o.Password) || !string.IsNullOrEmpty(o.PasswordHash),
        "Either Admin:PasswordHash (preferred) or Admin:Password must be set.")
    .ValidateOnStart();

builder.Services
    .AddAuthentication(CookieAuthenticationDefaults.AuthenticationScheme)
    .AddCookie(options =>
    {
        options.LoginPath = "/Account/Login";
        options.LogoutPath = "/Account/Logout";
        options.AccessDeniedPath = "/Account/Login";
        options.ExpireTimeSpan = TimeSpan.FromHours(8);
        options.SlidingExpiration = true;
        options.Cookie.Name = "portfolio.auth";
        options.Cookie.HttpOnly = true;
        options.Cookie.SecurePolicy = CookieSecurePolicy.Always;
        options.Cookie.SameSite = SameSiteMode.Strict;
    });

builder.Services.AddRateLimiter(options =>
{
    options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;
    options.AddPolicy("login", httpContext =>
        RateLimitPartition.GetFixedWindowLimiter(
            httpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown",
            _ => new FixedWindowRateLimiterOptions
            {
                PermitLimit = 5,
                Window = TimeSpan.FromMinutes(1),
            }));
});

builder.Services.AddMemoryCache();
builder.Services.AddSingleton<IFirebaseService, FirebaseService>();
builder.Services.AddSingleton<IPortfolioService, PortfolioService>();
builder.Services.AddScoped<ApiExceptionFilter>();

builder.Services.AddControllersWithViews();

var app = builder.Build();

if (string.IsNullOrEmpty(builder.Configuration["Admin:PasswordHash"]))
    StartupLog.PlaintextAdminPassword(app.Logger);

if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Home/Error");
    app.UseHsts();
}

app.UseHttpsRedirection();
app.UseStaticFiles();
app.UseRouting();
app.UseRateLimiter();

app.Use(async (ctx, next) =>
{
    ctx.Response.Headers["X-Frame-Options"] = "SAMEORIGIN";
    ctx.Response.Headers["X-Content-Type-Options"] = "nosniff";
    ctx.Response.Headers["Referrer-Policy"] = "strict-origin-when-cross-origin";
    ctx.Response.Headers["Permissions-Policy"] = "camera=(), microphone=(), geolocation=()";
    ctx.Response.Headers["Content-Security-Policy"] =
        "default-src 'self'; " +
        "script-src 'self'; " +
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdnjs.cloudflare.com; " +
        "font-src 'self' https://fonts.gstatic.com https://cdnjs.cloudflare.com; " +
        "img-src 'self' data:; " +
        "media-src 'self' blob:; " +
        "frame-ancestors 'self'; " +
        "base-uri 'self'; " +
        "form-action 'self'";
    await next();
});

app.UseAuthentication();
app.UseAuthorization();

app.MapControllerRoute(
    name: "default",
    pattern: "{controller=Home}/{action=Index}/{id?}");

app.Run();

internal static partial class StartupLog
{
    [LoggerMessage(EventId = 1, Level = LogLevel.Warning,
        Message = "Admin password is stored in plaintext. Generate a hash with 'dotnet run -- hash-password <password>' and set Admin:PasswordHash.")]
    public static partial void PlaintextAdminPassword(ILogger logger);
}
