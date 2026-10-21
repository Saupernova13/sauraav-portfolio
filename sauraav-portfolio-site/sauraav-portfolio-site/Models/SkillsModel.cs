using System.ComponentModel.DataAnnotations;

namespace sauraav_portfolio_site.Models;

public sealed class SkillsModel : IPortfolioEntry
{
    public const int MinLevel = 1;
    public const int MaxLevel = 10;

    [Required, StringLength(200)] public string? SkillName { get; set; }
    [Range(MinLevel, MaxLevel)] public int SkillLevel { get; set; }

    string? IPortfolioEntry.DisplayName => SkillName;
}
