using System.Text.Json;

namespace sauraav_portfolio_site.Services.Sections;

/// <summary>
/// Non-generic admin surface for one keyed section, so controllers can route by section name
/// without knowing the entry type.
/// </summary>
public interface ISectionAdmin
{
    string SectionName { get; }

    Task<IReadOnlyDictionary<string, object>> GetAllAsync(CancellationToken cancellationToken = default);

    /// <summary>
    /// Validates and stores the payload. When <paramref name="originalKey"/> is given and differs from the
    /// new key (the entry was renamed), the old entry is removed.
    /// </summary>
    Task<SectionWriteResult> UpsertAsync(JsonElement payload, string? originalKey, CancellationToken cancellationToken = default);

    Task DeleteAsync(string key, CancellationToken cancellationToken = default);
}
