using sauraav_portfolio_site.Models;

namespace sauraav_portfolio_site.Services.Portfolio;

/// <summary>Read side of the portfolio used by the public pages.</summary>
public interface IPortfolioService
{
    Task<PortfolioViewModel> GetPortfolioAsync(CancellationToken cancellationToken = default);
}
