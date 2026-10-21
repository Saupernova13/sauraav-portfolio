namespace sauraav_portfolio_site.Models;

/// <summary>A portfolio entry that carries an inline base64 image.</summary>
public interface IHasImage
{
    string? ImageBase64 { get; set; }
}
