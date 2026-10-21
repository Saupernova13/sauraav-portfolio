using System.ComponentModel.DataAnnotations;
using sauraav_portfolio_site.Models.Validation;

namespace sauraav_portfolio_site.Models;

public sealed class ProjectModel : IPortfolioEntry
{
    [Required, StringLength(200)] public string? ProjectName { get; set; }
    [StringLength(2000)] public string? Description { get; set; }
    [StringLength(500), HttpUrl] public string? ProjectLink { get; set; }

    /// <summary>Site-relative path returned by the media upload endpoint, e.g. <c>/videos/{guid}.mp4</c>.</summary>
    [StringLength(300), RegularExpression(@"^(/videos/[A-Za-z0-9\-]+\.(mp4|webm))?$", ErrorMessage = "Demo video must be an uploaded /videos path.")]
    public string? DemoVideoPath { get; set; }

    string? IPortfolioEntry.DisplayName => ProjectName;
}
