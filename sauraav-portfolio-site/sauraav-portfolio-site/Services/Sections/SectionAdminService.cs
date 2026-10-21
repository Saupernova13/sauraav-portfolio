using System.ComponentModel.DataAnnotations;
using System.Text.Json;
using sauraav_portfolio_site.Models;
using sauraav_portfolio_site.Services.Portfolio;

namespace sauraav_portfolio_site.Services.Sections;

public sealed class SectionAdminService<T> : ISectionAdmin where T : class, IPortfolioEntry
{
    private static readonly JsonSerializerOptions JsonOptions = new(JsonSerializerDefaults.Web);

    private readonly IPortfolioSectionRepository<T> _repository;
    private readonly IPortfolioCache _cache;
    private readonly IEnumerable<IEntryRemovedHandler<T>> _removedHandlers;

    public SectionAdminService(
        IPortfolioSectionRepository<T> repository,
        IPortfolioCache cache,
        IEnumerable<IEntryRemovedHandler<T>> removedHandlers)
    {
        _repository = repository;
        _cache = cache;
        _removedHandlers = removedHandlers;
    }

    public string SectionName => _repository.SectionName;

    public async Task<IReadOnlyDictionary<string, object>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        var entries = await _repository.GetAllAsync(cancellationToken);
        return entries.ToDictionary(e => e.Key, e => (object)e.Value, StringComparer.Ordinal);
    }

    public async Task<SectionWriteResult> UpsertAsync(JsonElement payload, string? originalKey, CancellationToken cancellationToken = default)
    {
        T? entry;
        try
        {
            entry = payload.Deserialize<T>(JsonOptions);
        }
        catch (JsonException)
        {
            return SectionWriteResult.Invalid(string.Empty, "The request body is not valid JSON for this section.");
        }

        if (entry is null)
        {
            return SectionWriteResult.Invalid(string.Empty, "The request body is empty.");
        }

        var errors = Validate(entry);
        if (errors.Count > 0)
        {
            return SectionWriteResult.Invalid(errors);
        }

        if (!PortfolioKey.TryCreate(entry.DisplayName, out var key))
        {
            return SectionWriteResult.Invalid("name", "A name is required.");
        }

        if (originalKey is not null && !PortfolioKey.IsValid(originalKey))
        {
            return SectionWriteResult.Invalid("originalKey", "The original key is invalid.");
        }

        await _repository.UpsertAsync(entry, cancellationToken);

        if (originalKey is not null && !string.Equals(originalKey, key, StringComparison.Ordinal))
        {
            await _repository.DeleteAsync(originalKey, cancellationToken);
        }

        _cache.Invalidate();
        return SectionWriteResult.Success(key);
    }

    public async Task DeleteAsync(string key, CancellationToken cancellationToken = default)
    {
        if (!PortfolioKey.IsValid(key))
        {
            throw new ArgumentException("Invalid section key.", nameof(key));
        }

        var existing = await _repository.GetAsync(key, cancellationToken);
        await _repository.DeleteAsync(key, cancellationToken);
        _cache.Invalidate();

        if (existing is null)
        {
            return;
        }

        foreach (var handler in _removedHandlers)
        {
            await handler.OnRemovedAsync(existing, cancellationToken);
        }
    }

    private static Dictionary<string, string[]> Validate(T entry)
    {
        var results = new List<ValidationResult>();
        Validator.TryValidateObject(entry, new ValidationContext(entry), results, validateAllProperties: true);

        return results
            .SelectMany(r => r.MemberNames.DefaultIfEmpty(string.Empty).Select(m => (Member: ToCamelCase(m), r.ErrorMessage)))
            .GroupBy(x => x.Member, StringComparer.Ordinal)
            .ToDictionary(g => g.Key, g => g.Select(x => x.ErrorMessage ?? "Invalid value.").ToArray(), StringComparer.Ordinal);
    }

    private static string ToCamelCase(string name) =>
        name.Length == 0 ? name : string.Concat(char.ToLowerInvariant(name[0]).ToString(), name.AsSpan(1));
}
