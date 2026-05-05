using sauraav_portfolio_site.Models;

namespace sauraav_portfolio_site.Services;

public interface IPortfolioService
{
    Task<PortfolioViewModel> GetPortfolioAsync();
}
