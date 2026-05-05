using System.ComponentModel.DataAnnotations;

namespace sauraav_portfolio_site.Models;

public sealed class WorkExperienceModel
{
    [Required, StringLength(200)] public string? Title { get; set; }
    [StringLength(200)] public string? Location { get; set; }
    public List<string> Accomplishments { get; set; } = [];
    public string? StartDate { get; set; }
    public string? EndDate { get; set; }
    public string? ImageBase64 { get; set; }
}
