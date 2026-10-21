namespace sauraav_portfolio_site.Models;

/// <summary>An item stored in a keyed portfolio section (education, projects, ...).</summary>
public interface IPortfolioEntry
{
    /// <summary>Human-readable name the storage key is derived from.</summary>
    string? DisplayName { get; }
}
