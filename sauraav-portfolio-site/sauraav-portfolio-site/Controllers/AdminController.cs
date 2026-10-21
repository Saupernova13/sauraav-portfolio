using System.Text.Json;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using sauraav_portfolio_site.Filters;
using sauraav_portfolio_site.Models;
using sauraav_portfolio_site.Services.Media;
using sauraav_portfolio_site.Services.Portfolio;
using sauraav_portfolio_site.Services.Sections;

namespace sauraav_portfolio_site.Controllers;

/// <summary>
/// Admin API. Keyed sections share one set of endpoints and are resolved by name through
/// <see cref="ISectionRegistry"/>, so adding a section needs no controller change.
/// </summary>
[Authorize]
[AutoValidateAntiforgeryToken]
[ServiceFilter(typeof(ApiExceptionFilter))]
[ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
[Route("Admin")]
public sealed class AdminController : Controller
{
    private readonly ISectionRegistry _sections;
    private readonly ISummaryRepository _summary;
    private readonly IPortfolioCache _cache;
    private readonly IMediaStorage _media;

    public AdminController(ISectionRegistry sections, ISummaryRepository summary, IPortfolioCache cache, IMediaStorage media)
    {
        _sections = sections;
        _summary = summary;
        _cache = cache;
        _media = media;
    }

    [HttpGet("")]
    public IActionResult Index() => View();

    [HttpGet("Data")]
    public async Task<IActionResult> Data(CancellationToken cancellationToken)
    {
        var summaryTask = _summary.GetAsync(cancellationToken);
        var sectionTasks = _sections.All.Select(s => s.GetAllAsync(cancellationToken)).ToArray();
        await Task.WhenAll(sectionTasks.Append<Task>(summaryTask));

        var payload = new Dictionary<string, object?>(StringComparer.Ordinal)
        {
            [PortfolioSections.Summary] = await summaryTask,
        };

        var index = 0;
        foreach (var section in _sections.All)
        {
            payload[section.SectionName] = await sectionTasks[index++];
        }

        return Json(payload);
    }

    [HttpPut("Summary")]
    public async Task<IActionResult> SaveSummary([FromBody] SummaryModel summary, CancellationToken cancellationToken)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ApiResponse.Invalid(ModelState));
        }

        await _summary.SaveAsync(summary, cancellationToken);
        _cache.Invalidate();
        return Json(ApiResponse.Ok());
    }

    [HttpPost("Sections/{section}")]
    public async Task<IActionResult> SaveEntry(
        string section,
        [FromBody] JsonElement payload,
        [FromQuery] string? originalKey,
        CancellationToken cancellationToken)
    {
        if (!_sections.TryGet(section, out var admin))
        {
            return NotFound(ApiResponse.Fail("Unknown section."));
        }

        var result = await admin.UpsertAsync(payload, originalKey, cancellationToken);
        return result.Succeeded
            ? Json(ApiResponse.Ok(result.Key))
            : BadRequest(ApiResponse.Fail("Please fix the highlighted fields.", result.Errors));
    }

    [HttpDelete("Sections/{section}/{key}")]
    public async Task<IActionResult> DeleteEntry(string section, string key, CancellationToken cancellationToken)
    {
        if (!_sections.TryGet(section, out var admin))
        {
            return NotFound(ApiResponse.Fail("Unknown section."));
        }

        if (!PortfolioKey.IsValid(key))
        {
            return BadRequest(ApiResponse.Fail("Invalid key."));
        }

        await admin.DeleteAsync(key, cancellationToken);
        return Json(ApiResponse.Ok(key));
    }

    [HttpPost("Media/Videos")]
    [RequestSizeLimit(VideoUploadPolicy.MaxBytes + 1024)]
    [RequestFormLimits(MultipartBodyLengthLimit = VideoUploadPolicy.MaxBytes + 1024)]
    public async Task<IActionResult> UploadVideo(IFormFile? video, CancellationToken cancellationToken)
    {
        if (video is null)
        {
            return BadRequest(ApiResponse.Fail("Choose a video file to upload."));
        }

        var saved = await _media.SaveVideoAsync(video, cancellationToken);
        return saved.Succeeded
            ? Json(ApiResponse.Ok(saved.Path))
            : BadRequest(ApiResponse.Fail(saved.Error!));
    }
}
