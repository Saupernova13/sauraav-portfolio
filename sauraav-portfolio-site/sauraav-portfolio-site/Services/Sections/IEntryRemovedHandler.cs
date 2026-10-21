using sauraav_portfolio_site.Models;

namespace sauraav_portfolio_site.Services.Sections;

/// <summary>Hook invoked after an entry is deleted, e.g. to remove files it referenced.</summary>
public interface IEntryRemovedHandler<in T> where T : class, IPortfolioEntry
{
    Task OnRemovedAsync(T entry, CancellationToken cancellationToken = default);
}
