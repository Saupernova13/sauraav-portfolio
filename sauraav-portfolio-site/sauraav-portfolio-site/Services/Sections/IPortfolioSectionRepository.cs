using sauraav_portfolio_site.Models;

namespace sauraav_portfolio_site.Services.Sections;

/// <summary>Typed access to one keyed portfolio section. Keys are derived from the entry's display name.</summary>
public interface IPortfolioSectionRepository<T> where T : class, IPortfolioEntry
{
    string SectionName { get; }

    Task<IReadOnlyDictionary<string, T>> GetAllAsync(CancellationToken cancellationToken = default);

    Task<T?> GetAsync(string key, CancellationToken cancellationToken = default);

    /// <summary>Creates or replaces the entry and returns the key it was stored under.</summary>
    Task<string> UpsertAsync(T entry, CancellationToken cancellationToken = default);

    Task DeleteAsync(string key, CancellationToken cancellationToken = default);
}
