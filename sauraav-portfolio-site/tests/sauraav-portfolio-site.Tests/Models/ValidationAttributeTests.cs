using sauraav_portfolio_site.Models.Validation;

namespace sauraav_portfolio_site.Tests.Models;

public sealed class ValidationAttributeTests
{
    [Theory]
    [InlineData(null, true)]
    [InlineData("", true)]
    [InlineData("https://example.com/project", true)]
    [InlineData("http://example.com", true)]
    [InlineData("javascript:alert(1)", false)]
    [InlineData("ftp://example.com", false)]
    [InlineData("example.com", false)]
    public void HttpUrl_accepts_only_absolute_http_links(string? value, bool expected)
    {
        Assert.Equal(expected, new HttpUrlAttribute().IsValid(value));
    }

    [Theory]
    [InlineData(null, true)]
    [InlineData("", true)]
    [InlineData("data:image/png;base64,iVBORw0KGgo=", true)]
    [InlineData("data:image/jpeg;base64,/9j/4AAQ", true)]
    [InlineData("iVBORw0KGgo=", true)]
    [InlineData("data:text/html;base64,PHNjcmlwdD4=", false)]
    [InlineData("data:image/svg+xml;base64,PHN2Zz4=", false)]
    [InlineData("data:image/png;base64,***", false)]
    public void ImageData_accepts_raster_image_data_uris_or_bare_base64(string? value, bool expected)
    {
        Assert.Equal(expected, new ImageDataAttribute().IsValid(value));
    }

    [Fact]
    public void ImageData_rejects_payloads_over_the_size_budget()
    {
        var attribute = new ImageDataAttribute { MaxLength = 16 };
        Assert.False(attribute.IsValid("data:image/png;base64,iVBORw0KGgo="));
    }
}
