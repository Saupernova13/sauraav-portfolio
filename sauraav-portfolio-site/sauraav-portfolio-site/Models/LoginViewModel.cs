using System.ComponentModel.DataAnnotations;

namespace sauraav_portfolio_site.Models;

public sealed class LoginViewModel
{
    [Required] public string Username { get; set; } = string.Empty;
    [Required] public string Password { get; set; } = string.Empty;
}
