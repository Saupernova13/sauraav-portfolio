using System.Security.Claims;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using sauraav_portfolio_site.Models;
using sauraav_portfolio_site.Services.Auth;

namespace sauraav_portfolio_site.Controllers;

[ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
public sealed class AccountController : Controller
{
    public const string CredentialVersionClaim = "credential_version";
    public const string LoginRateLimitPolicy = "login";

    private static readonly Action<ILogger, string?, Exception?> LogFailedLogin = LoggerMessage.Define<string?>(
        LogLevel.Warning,
        new EventId(1, "AdminLoginFailed"),
        "Failed admin login from {RemoteIp}");

    private static readonly Action<ILogger, string?, Exception?> LogSuccessfulLogin = LoggerMessage.Define<string?>(
        LogLevel.Information,
        new EventId(2, "AdminLoginSucceeded"),
        "Admin logged in from {RemoteIp}");

    private readonly IAdminCredentialVerifier _credentials;
    private readonly ILogger<AccountController> _logger;

    public AccountController(IAdminCredentialVerifier credentials, ILogger<AccountController> logger)
    {
        _credentials = credentials;
        _logger = logger;
    }

    [HttpGet]
    public IActionResult Login(string? returnUrl = null, bool throttled = false)
    {
        if (User.Identity?.IsAuthenticated == true)
        {
            return RedirectToAction("Index", "Admin");
        }

        ViewData["ReturnUrl"] = Url.IsLocalUrl(returnUrl) ? returnUrl : null;
        if (throttled)
        {
            ModelState.AddModelError(string.Empty, "Too many attempts. Please wait a minute and try again.");
        }

        return View(new LoginViewModel());
    }

    [HttpPost]
    [ValidateAntiForgeryToken]
    [EnableRateLimiting(LoginRateLimitPolicy)]
    public async Task<IActionResult> Login(LoginViewModel model, string? returnUrl = null)
    {
        ArgumentNullException.ThrowIfNull(model);
        ViewData["ReturnUrl"] = Url.IsLocalUrl(returnUrl) ? returnUrl : null;

        var remoteIp = HttpContext.Connection.RemoteIpAddress?.ToString();

        if (!ModelState.IsValid || !_credentials.Verify(model.Username, model.Password))
        {
            LogFailedLogin(_logger, remoteIp, null);
            ModelState.AddModelError(string.Empty, "Invalid username or password.");
            return View(new LoginViewModel { Username = model.Username });
        }

        var claims = new List<Claim>
        {
            new(ClaimTypes.Name, model.Username),
            new(CredentialVersionClaim, _credentials.CredentialVersion),
        };
        var identity = new ClaimsIdentity(claims, CookieAuthenticationDefaults.AuthenticationScheme);
        await HttpContext.SignInAsync(CookieAuthenticationDefaults.AuthenticationScheme, new ClaimsPrincipal(identity));
        LogSuccessfulLogin(_logger, remoteIp, null);

        return Url.IsLocalUrl(returnUrl) ? Redirect(returnUrl) : RedirectToAction("Index", "Admin");
    }

    [HttpPost]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> Logout()
    {
        await HttpContext.SignOutAsync(CookieAuthenticationDefaults.AuthenticationScheme);
        return RedirectToAction("Index", "Home");
    }
}
