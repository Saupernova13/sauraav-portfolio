using Microsoft.Extensions.Logging.Abstractions;
using sauraav_portfolio_site.Services.Images;

namespace sauraav_portfolio_site.Tests.Images;

public sealed class ImageTests
{
    private readonly Base64ImageSanitizer _sanitizer = new(NullLogger<Base64ImageSanitizer>.Instance);

    [Fact]
    public void Clean_strips_data_uri_prefix_and_whitespace()
    {
        var raw = "data:image/png;base64,aGVs\nbG8g\r\nd29y bGQ=";
        Assert.Equal("aGVsbG8gd29ybGQ=", _sanitizer.Clean(raw));
    }

    [Theory]
    [InlineData(null)]
    [InlineData("")]
    [InlineData("   ")]
    [InlineData("not base64!!")]
    public void Clean_returns_null_for_empty_or_invalid_input(string? raw)
    {
        Assert.Null(_sanitizer.Clean(raw));
    }

    [Fact]
    public void Detect_recognises_png_jpeg_gif_and_webp()
    {
        Assert.Equal("image/png", ImageContentType.Detect([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A]));
        Assert.Equal("image/jpeg", ImageContentType.Detect([0xFF, 0xD8, 0xFF, 0xE0]));
        Assert.Equal("image/gif", ImageContentType.Detect("GIF89a"u8));
        Assert.Equal("image/webp", ImageContentType.Detect("RIFF\0\0\0\0WEBPVP8 "u8));
    }

    [Fact]
    public void Detect_returns_null_for_non_images()
    {
        Assert.Null(ImageContentType.Detect("<svg xmlns='http://www.w3.org/2000/svg'/>"u8));
        Assert.Null(ImageContentType.Detect(ReadOnlySpan<byte>.Empty));
    }
}
