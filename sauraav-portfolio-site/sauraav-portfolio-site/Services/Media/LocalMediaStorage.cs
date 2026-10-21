using System.Text.RegularExpressions;

namespace sauraav_portfolio_site.Services.Media;

/// <summary>Writes videos to <c>wwwroot/videos</c> under a generated name; never trusts the client's file name.</summary>
public sealed partial class LocalMediaStorage : IMediaStorage
{
    public const string PublicFolder = "videos";

    private readonly string _root;

    public LocalMediaStorage(IWebHostEnvironment environment)
    {
        ArgumentNullException.ThrowIfNull(environment);
        _root = Path.Combine(environment.WebRootPath, PublicFolder);
    }

    public async Task<MediaSaveResult> SaveVideoAsync(IFormFile file, CancellationToken cancellationToken = default)
    {
        ArgumentNullException.ThrowIfNull(file);

        if (file.Length == 0)
        {
            return MediaSaveResult.Failure("The uploaded file is empty.");
        }

        if (file.Length > VideoUploadPolicy.MaxBytes)
        {
            return MediaSaveResult.Failure($"Videos must be smaller than {VideoUploadPolicy.MaxBytes / (1024 * 1024)} MB.");
        }

        if (!VideoUploadPolicy.IsAcceptableContentType(file.ContentType))
        {
            return MediaSaveResult.Failure("Only video files are accepted.");
        }

        await using var source = file.OpenReadStream();
        var header = new byte[VideoUploadPolicy.SignatureLength];
        var read = await source.ReadAtLeastAsync(header, header.Length, throwOnEndOfStream: false, cancellationToken);

        var extension = VideoUploadPolicy.DetectExtension(header.AsSpan(0, read));
        if (extension is null)
        {
            return MediaSaveResult.Failure("The file is not a recognised MP4 or WebM video.");
        }

        Directory.CreateDirectory(_root);
        var fileName = $"{Guid.NewGuid():N}{extension}";
        var fullPath = Path.Combine(_root, fileName);

        await using (var target = new FileStream(fullPath, FileMode.CreateNew, FileAccess.Write, FileShare.None, 81920, useAsync: true))
        {
            await target.WriteAsync(header.AsMemory(0, read), cancellationToken);
            await source.CopyToAsync(target, cancellationToken);
        }

        return MediaSaveResult.Success($"/{PublicFolder}/{fileName}");
    }

    public Task DeleteAsync(string publicPath, CancellationToken cancellationToken = default)
    {
        cancellationToken.ThrowIfCancellationRequested();

        var match = StoredVideoPath().Match(publicPath ?? string.Empty);
        if (!match.Success)
        {
            return Task.CompletedTask;
        }

        var fullPath = Path.Combine(_root, match.Groups["name"].Value);
        if (File.Exists(fullPath))
        {
            File.Delete(fullPath);
        }

        return Task.CompletedTask;
    }

    [GeneratedRegex(@"^/videos/(?<name>[0-9a-f]{32}\.(mp4|webm))$", RegexOptions.CultureInvariant)]
    private static partial Regex StoredVideoPath();
}
