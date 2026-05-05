using System.ComponentModel.DataAnnotations;

namespace sauraav_portfolio_site.Models;

public sealed class QualificationModel
{
    [Required, StringLength(200)] public string? QualificationName { get; set; }
    public string? ImageBase64 { get; set; }
}
