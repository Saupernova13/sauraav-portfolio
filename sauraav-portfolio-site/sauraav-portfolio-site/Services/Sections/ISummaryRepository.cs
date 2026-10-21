using sauraav_portfolio_site.Models;

namespace sauraav_portfolio_site.Services.Sections;

/// <summary>The single "About me" summary node.</summary>
public interface ISummaryRepository
{
    Task<SummaryModel?> GetAsync(CancellationToken cancellationToken = default);

    Task SaveAsync(SummaryModel summary, CancellationToken cancellationToken = default);
}
