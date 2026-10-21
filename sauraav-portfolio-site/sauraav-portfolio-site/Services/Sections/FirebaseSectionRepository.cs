using sauraav_portfolio_site.Models;
using sauraav_portfolio_site.Services.Firebase;
using sauraav_portfolio_site.Services.Images;

namespace sauraav_portfolio_site.Services.Sections;

public sealed class FirebaseSectionRepository<T> : IPortfolioSectionRepository<T> where T : class, IPortfolioEntry
{
    private readonly IFirebaseService _firebase;
    private readonly IImageDataSanitizer _images;

    public FirebaseSectionRepository(string sectionName, IFirebaseService firebase, IImageDataSanitizer images)
    {
        SectionName = sectionName;
        _firebase = firebase;
        _images = images;
    }

    public string SectionName { get; }

    public async Task<IReadOnlyDictionary<string, T>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        var entries = await _firebase.GetData<Dictionary<string, T>>(SectionName, cancellationToken);
        if (entries is null)
        {
            return new Dictionary<string, T>(StringComparer.Ordinal);
        }

        foreach (var entry in entries.Values)
        {
            Clean(entry);
        }

        return entries;
    }

    public async Task<T?> GetAsync(string key, CancellationToken cancellationToken = default)
    {
        var entry = await _firebase.GetData<T>(Path(key), cancellationToken);
        if (entry is not null)
        {
            Clean(entry);
        }

        return entry;
    }

    public async Task<string> UpsertAsync(T entry, CancellationToken cancellationToken = default)
    {
        ArgumentNullException.ThrowIfNull(entry);
        if (!PortfolioKey.TryCreate(entry.DisplayName, out var key))
        {
            throw new ArgumentException("Entry has no usable display name.", nameof(entry));
        }

        Clean(entry);
        await _firebase.SetData(Path(key), entry, cancellationToken);
        return key;
    }

    public Task DeleteAsync(string key, CancellationToken cancellationToken = default) =>
        _firebase.DeleteData(Path(key), cancellationToken);

    private string Path(string key)
    {
        if (!PortfolioKey.IsValid(key))
        {
            throw new ArgumentException("Invalid section key.", nameof(key));
        }

        return $"{SectionName}/{key}";
    }

    private void Clean(T entry)
    {
        if (entry is IHasImage withImage)
        {
            withImage.ImageBase64 = _images.Clean(withImage.ImageBase64);
        }
    }
}
