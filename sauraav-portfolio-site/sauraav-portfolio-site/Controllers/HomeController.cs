using Microsoft.AspNetCore.Mvc;
using sauraav_portfolio_site.Models;
using sauraav_portfolio_site.Services;
using System.Diagnostics;

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

    public async Task<IActionResult> Index()
    {
        try
        {
            var viewModel = await _portfolioService.GetPortfolioAsync();
            return View(viewModel);
        }
        catch (Exception ex)
        {
            LogPortfolioError(_logger, ex);
            return View("Error", new ErrorViewModel { RequestId = Activity.Current?.Id ?? HttpContext.TraceIdentifier });
        }
    }

    [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
    public IActionResult Error() =>
        View(new ErrorViewModel { RequestId = Activity.Current?.Id ?? HttpContext.TraceIdentifier });
}
