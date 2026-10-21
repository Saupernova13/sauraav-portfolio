using System.Diagnostics;
using Microsoft.AspNetCore.Mvc;
using sauraav_portfolio_site.Models;
using sauraav_portfolio_site.Services.Portfolio;

namespace sauraav_portfolio_site.Controllers;

public sealed class HomeController : Controller
{
    private static readonly Action<ILogger, Exception?> LogPortfolioError =
        LoggerMessage.Define(LogLevel.Error, new EventId(1, "PortfolioFetchError"), "Error fetching portfolio data");

    private readonly ILogger<HomeController> _logger;
    private readonly IPortfolioService _portfolioService;

    public HomeController(ILogger<HomeController> logger, IPortfolioService portfolioService)
    {
        _logger = logger;
        _portfolioService = portfolioService;
    }

    [ResponseCache(Duration = 60, Location = ResponseCacheLocation.Any)]
    public async Task<IActionResult> Index(CancellationToken cancellationToken)
    {
        try
        {
            var viewModel = await _portfolioService.GetPortfolioAsync(cancellationToken);
            return View(viewModel);
        }
        catch (Exception ex) when (ex is not OperationCanceledException)
        {
            LogPortfolioError(_logger, ex);
            Response.StatusCode = StatusCodes.Status503ServiceUnavailable;
            return View("Error", new ErrorViewModel { RequestId = Activity.Current?.Id ?? HttpContext.TraceIdentifier });
        }
    }

    [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
    public IActionResult Error() =>
        View(new ErrorViewModel { RequestId = Activity.Current?.Id ?? HttpContext.TraceIdentifier });
}
