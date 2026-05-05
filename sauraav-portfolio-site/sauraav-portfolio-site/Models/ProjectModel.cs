using System.ComponentModel.DataAnnotations;

namespace sauraav_portfolio_site.Models;

public sealed class ProjectModel
{
    [Required, StringLength(200)] public string? ProjectName { get; set; }
    [StringLength(2000)] public string? Description { get; set; }
    [StringLength(500)] public string? ProjectLink { get; set; }
    public string? DemoVideoPath { get; set; }
}
