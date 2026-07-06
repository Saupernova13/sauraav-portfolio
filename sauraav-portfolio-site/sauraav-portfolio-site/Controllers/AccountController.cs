using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.Extensions.Options;
using sauraav_portfolio_site.Models;
using sauraav_portfolio_site.Services;

namespace sauraav_portfolio_site.Controllers;

public sealed class AccountController : Controller
{
    private static readonly Action<ILogger, string, Exception?> LogFailedLogin =
        LoggerMessage.Define<string>(LogLevel.Warning, new EventId(1, "FailedLogin"), "Failed admin login attempt from {RemoteIp}");

    private readonly AdminOptions _adminOptions;
    private readonly ILogger<AccountController> _logger;

    public AccountController(IOptions<AdminOptions> options, ILogger<AccountController> logger)
    {
        _adminOptions = options.Value;
        _logger = logger;
    }

    [HttpGet]
    public IActionResult Login(string? returnUrl = null)
    {
        ViewData["ReturnUrl"] = returnUrl;
        return View();
    }

    [HttpPost]
    [ValidateAntiForgeryToken]
    [EnableRateLimiting("login")]
    public async Task<IActionResult> Login(LoginViewModel model, string? returnUrl = null)
    {
        ViewData["ReturnUrl"] = returnUrl;

        if (!ModelState.IsValid)
            return View(model);

        if (!CredentialsValid(model))
        {
            LogFailedLogin(_logger, HttpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown", null);
            ModelState.AddModelError(string.Empty, "Invalid credentials.");
            return View(model);
        }

        var claims = new List<Claim> { new(ClaimTypes.Name, model.Username) };
        var identity = new ClaimsIdentity(claims, CookieAuthenticationDefaults.AuthenticationScheme);
        await HttpContext.SignInAsync(CookieAuthenticationDefaults.AuthenticationScheme, new ClaimsPrincipal(identity));

        if (Url.IsLocalUrl(returnUrl))
            return Redirect(returnUrl);

        return RedirectToAction("Index", "Admin");
    }

    [HttpPost]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> Logout()
    {
        await HttpContext.SignOutAsync(CookieAuthenticationDefaults.AuthenticationScheme);
        return RedirectToAction("Index", "Home");
    }

    private bool CredentialsValid(LoginViewModel model)
    {
        var usernameMatches = FixedTimeEquals(model.Username, _adminOptions.Username);

        var passwordMatches = string.IsNullOrEmpty(_adminOptions.PasswordHash)
            ? FixedTimeEquals(model.Password, _adminOptions.Password)
            : PasswordHasher.Verify(model.Password, _adminOptions.PasswordHash);

        return usernameMatches && passwordMatches;
    }

    private static bool FixedTimeEquals(string a, string b) =>
        CryptographicOperations.FixedTimeEquals(Encoding.UTF8.GetBytes(a), Encoding.UTF8.GetBytes(b));
}
