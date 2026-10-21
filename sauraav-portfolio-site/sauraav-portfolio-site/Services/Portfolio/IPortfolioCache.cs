namespace sauraav_portfolio_site.Services.Portfolio;

/// <summary>Lets writers drop the cached public portfolio after a change.</summary>
public interface IPortfolioCache
{
    void Invalidate();
}
