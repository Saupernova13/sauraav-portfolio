using System.ComponentModel.DataAnnotations;

namespace sauraav_portfolio_site.Models;

public sealed class SummaryModel
{
    [StringLength(5000)] public string? Summary { get; set; }
}
