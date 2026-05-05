using System.ComponentModel.DataAnnotations;

namespace sauraav_portfolio_site.Models;

public sealed class EducationModel
{
    [Required, StringLength(200)] public string? SchoolName { get; set; }
    [StringLength(2000)] public string? Description { get; set; }
    [StringLength(200)] public string? Location { get; set; }
    public string? StartDate { get; set; }
    public string? EndDate { get; set; }
    public string? ImageBase64 { get; set; }
}
