using System.ComponentModel.DataAnnotations;
using sauraav_portfolio_site.Models.Validation;

namespace sauraav_portfolio_site.Models;

public sealed class QualificationModel : IPortfolioEntry, IHasImage
{
    [Required, StringLength(200)] public string? QualificationName { get; set; }
    [ImageData] public string? ImageBase64 { get; set; }

    string? IPortfolioEntry.DisplayName => QualificationName;
}
