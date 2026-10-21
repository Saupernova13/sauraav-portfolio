using System.Threading.RateLimiting;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.AspNetCore.ResponseCompression;
using Microsoft.Net.Http.Headers;
using sauraav_portfolio_site.Controllers;
using sauraav_portfolio_site.Filters;
using sauraav_portfolio_site.Middleware;
using sauraav_portfolio_site.Services;
using sauraav_portfolio_site.Services.Auth;
using sauraav_portfolio_site.Tools;

if (args is [PasswordHashCommand.Name])
{
    return await PasswordHashCommand.RunAsync(Console.In, Console.Out, Console.Error);
}

var builder = WebApplication.CreateBuilder(args);
var isDevelopment = builder.Environment.IsDevelopment();

builder.Services.AddPortfolio(builder.Configuration);
builder.Services.AddAdminCredentials(builder.Configuration);

builder.Services
    .AddAuthentication(CookieAuthenticationDefaults.AuthenticationScheme)
    .AddCookie(options =>
    {
        options.LoginPath = "/Account/Login";
        options.LogoutPath = "/Account/Logout";
        options.AccessDeniedPath = "/Account/Login";
        options.ExpireTimeSpan = TimeSpan.FromHours(4);
        options.SlidingExpiration = true;
        options.Cookie.Name = "portfolio.admin";
        options.Cookie.HttpOnly = true;
        options.Cookie.IsEssential = true;
        options.Cookie.SameSite = Microsoft.AspNetCore.Http.SameSiteMode.Strict;
        options.Cookie.SecurePolicy = isDevelopment ? CookieSecurePolicy.SameAsRequest : CookieSecurePolicy.Always;
        options.Events.OnValidatePrincipal = async context =>
        {
            // End sessions issued before the configured credentials last changed.
            var verifier = context.HttpContext.RequestServices.GetRequiredService<IAdminCredentialVerifier>();
            var issuedFor = context.Principal?.FindFirst(AccountController.CredentialVersionClaim)?.Value;
            if (!string.Equals(issuedFor, verifier.CredentialVersion, StringComparison.Ordinal))
            {
                context.RejectPrincipal();
                await context.HttpContext.SignOutAsync(CookieAuthenticationDefaults.AuthenticationScheme);
            }
        };
    });

builder.Services.AddAuthorization();

builder.Services.AddRateLimiter(options =>
{
    options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;
    options.AddPolicy(AccountController.LoginRateLimitPolicy, context =>
        RateLimitPartition.GetFixedWindowLimiter(
            context.Connection.RemoteIpAddress?.ToString() ?? "unknown",
            _ => new FixedWindowRateLimiterOptions
            {
                PermitLimit = 5,
                Window = TimeSpan.FromMinutes(1),
                QueueLimit = 0,
            }));
    options.OnRejected = (context, _) =>
    {
        context.HttpContext.Response.Redirect("/Account/Login?throttled=true");
        return ValueTask.CompletedTask;
    };
});

builder.Services.AddHsts(options =>
{
    options.MaxAge = TimeSpan.FromDays(365);
    options.IncludeSubDomains = true;
});

builder.Services.AddResponseCompression(options =>
{
    options.EnableForHttps = true;
    options.Providers.Add<BrotliCompressionProvider>();
    options.Providers.Add<GzipCompressionProvider>();
    options.MimeTypes = ResponseCompressionDefaults.MimeTypes.Concat(["image/svg+xml", "font/otf", "font/ttf"]);
});

builder.Services.AddSingleton<ApiExceptionFilter>();

var mvc = builder.Services.AddControllersWithViews();
if (isDevelopment)
{
    mvc.AddRazorRuntimeCompilation();
}

var app = builder.Build();

if (!isDevelopment)
{
    app.UseExceptionHandler("/Home/Error");
    app.UseHsts();
}

app.UseHttpsRedirection();
app.UseResponseCompression();
app.UseSecurityHeaders();

app.UseStaticFiles(new StaticFileOptions
{
    OnPrepareResponse = context =>
    {
        // Assets referenced with asp-append-version carry a content hash in ?v=, so they can be cached forever.
        var versioned = context.Context.Request.Query.ContainsKey("v");
        context.Context.Response.GetTypedHeaders().CacheControl = new CacheControlHeaderValue
        {
            Public = true,
            MaxAge = versioned ? TimeSpan.FromDays(365) : TimeSpan.FromDays(1),
        };
    },
});

app.UseRouting();
app.UseRateLimiter();
app.UseAuthentication();
app.UseAuthorization();

app.MapControllerRoute(
    name: "default",
    pattern: "{controller=Home}/{action=Index}/{id?}");

await app.RunAsync();
return 0;
