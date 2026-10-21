namespace sauraav_portfolio_site.Services.Media;

/// <summary>Stores uploaded demo videos and returns the site-relative path they are served from.</summary>
public interface IMediaStorage
{
    Task<MediaSaveResult> SaveVideoAsync(IFormFile file, CancellationToken cancellationToken = default);

    /// <summary>Deletes a file previously returned by <see cref="SaveVideoAsync"/>. Unknown paths are ignored.</summary>
    Task DeleteAsync(string publicPath, CancellationToken cancellationToken = default);
}

public sealed record MediaSaveResult(string? Path, string? Error)
{
    public bool Succeeded => Path is not null;

    public static MediaSaveResult Success(string path) => new(path, null);

    public static MediaSaveResult Failure(string error) => new(null, error);
}
