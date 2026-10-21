using System.ComponentModel.DataAnnotations;
using sauraav_portfolio_site.Models.Validation;

namespace sauraav_portfolio_site.Models;

public sealed class WorkExperienceModel : IPortfolioEntry, IHasImage
{
    [Required, StringLength(200)] public string? Title { get; set; }
    [StringLength(200)] public string? Location { get; set; }
    [MaxLength(50)] public List<string> Accomplishments { get; set; } = [];
    [StringLength(40)] public string? StartDate { get; set; }
    [StringLength(40)] public string? EndDate { get; set; }
    [ImageData] public string? ImageBase64 { get; set; }

    string? IPortfolioEntry.DisplayName => Title;
}
