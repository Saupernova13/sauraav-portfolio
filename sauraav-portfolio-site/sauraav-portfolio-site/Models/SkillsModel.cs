using System.ComponentModel.DataAnnotations;

namespace sauraav_portfolio_site.Models;

public sealed class SkillsModel
{
    [Required, StringLength(200)] public string? SkillName { get; set; }
    [Range(0, 100)] public int SkillLevel { get; set; }
}
