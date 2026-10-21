namespace sauraav_portfolio_site.Services.Images;

/// <summary>Normalises user-supplied base64 image data before it is stored or rendered.</summary>
public interface IImageDataSanitizer
{
    /// <summary>Returns bare base64 (no data-URI prefix, no whitespace), or <see langword="null"/> when invalid.</summary>
    string? Clean(string? value);
}
