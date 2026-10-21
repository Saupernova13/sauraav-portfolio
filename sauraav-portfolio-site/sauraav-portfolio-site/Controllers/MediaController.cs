using System.Security.Cryptography;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Net.Http.Headers;
using sauraav_portfolio_site.Services.Images;
using sauraav_portfolio_site.Services.Portfolio;
using sauraav_portfolio_site.Services.Sections;

namespace sauraav_portfolio_site.Controllers;

/// <summary>
/// Serves images that are stored inline (base64) in the database as cacheable, lazily-loadable
/// resources instead of embedding them in the HTML.
/// </summary>
[Route("media")]
public sealed class MediaController : Controller
{
    private static readonly TimeSpan ClientCacheLifetime = TimeSpan.FromDays(1);

    private readonly IPortfolioService _portfolio;

    public MediaController(IPortfolioService portfolio) => _portfolio = portfolio;

    [HttpGet("{section}/{key}")]
    public async Task<IActionResult> Image(string section, string key, CancellationToken cancellationToken)
    {
        if (!PortfolioKey.IsValid(key))
        {
            return NotFound();
        }

        var portfolio = await _portfolio.GetPortfolioAsync(cancellationToken);
        var entry = portfolio.FindImageEntry(section, key);
        if (entry?.ImageBase64 is not { Length: > 0 } base64)
        {
            return NotFound();
        }

        byte[] bytes;
        try
        {
            bytes = Convert.FromBase64String(base64);
        }
        catch (FormatException)
        {
            return NotFound();
        }

        var contentType = ImageContentType.Detect(bytes);
        if (contentType is null)
        {
            return NotFound();
        }

        var etag = new EntityTagHeaderValue($"\"{Convert.ToHexString(SHA256.HashData(bytes).AsSpan(0, 16))}\"");
        var responseHeaders = Response.GetTypedHeaders();
        responseHeaders.CacheControl = new CacheControlHeaderValue { Public = true, MaxAge = ClientCacheLifetime };
        responseHeaders.ETag = etag;

        var ifNoneMatch = Request.GetTypedHeaders().IfNoneMatch;
        if (ifNoneMatch is { Count: > 0 } && ifNoneMatch.Any(t => t.Compare(etag, useStrongComparison: false)))
        {
            return StatusCode(StatusCodes.Status304NotModified);
        }

        return File(bytes, contentType);
    }
}
