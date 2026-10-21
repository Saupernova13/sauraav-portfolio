namespace sauraav_portfolio_site.Services.Sections;

/// <summary>Outcome of an admin write: either the stored key or validation errors keyed by field.</summary>
public sealed class SectionWriteResult
{
    private SectionWriteResult(string? key, IReadOnlyDictionary<string, string[]> errors)
    {
        Key = key;
        Errors = errors;
    }

    public string? Key { get; }

    public IReadOnlyDictionary<string, string[]> Errors { get; }

    public bool Succeeded => Key is not null;

    public static SectionWriteResult Success(string key) =>
        new(key, new Dictionary<string, string[]>(StringComparer.Ordinal));

    public static SectionWriteResult Invalid(IReadOnlyDictionary<string, string[]> errors) => new(null, errors);

    public static SectionWriteResult Invalid(string field, string message) =>
        Invalid(new Dictionary<string, string[]>(StringComparer.Ordinal) { [field] = [message] });
}
