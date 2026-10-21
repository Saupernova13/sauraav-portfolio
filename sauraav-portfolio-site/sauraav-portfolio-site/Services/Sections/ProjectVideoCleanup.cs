using sauraav_portfolio_site.Models;
using sauraav_portfolio_site.Services.Media;

namespace sauraav_portfolio_site.Services.Sections;

/// <summary>Removes a project's uploaded demo video when the project is deleted.</summary>
public sealed class ProjectVideoCleanup : IEntryRemovedHandler<ProjectModel>
{
    private readonly IMediaStorage _media;

    public ProjectVideoCleanup(IMediaStorage media) => _media = media;

    public Task OnRemovedAsync(ProjectModel entry, CancellationToken cancellationToken = default)
    {
        ArgumentNullException.ThrowIfNull(entry);
        return string.IsNullOrEmpty(entry.DemoVideoPath)
            ? Task.CompletedTask
            : _media.DeleteAsync(entry.DemoVideoPath, cancellationToken);
    }
}
