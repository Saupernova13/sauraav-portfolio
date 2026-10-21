using System.Text.Json;
using Microsoft.Extensions.Logging.Abstractions;
using sauraav_portfolio_site.Models;
using sauraav_portfolio_site.Services.Firebase;
using sauraav_portfolio_site.Services.Images;
using sauraav_portfolio_site.Services.Portfolio;
using sauraav_portfolio_site.Services.Sections;

namespace sauraav_portfolio_site.Tests.Sections;

public sealed class SectionAdminServiceTests
{
    private readonly InMemoryFirebaseService _store = new();
    private readonly RecordingCache _cache = new();
    private readonly RecordingRemovedHandler _removed = new();
    private readonly FirebaseSectionRepository<ProjectModel> _repository;
    private readonly SectionAdminService<ProjectModel> _service;

    public SectionAdminServiceTests()
    {
        _repository = new FirebaseSectionRepository<ProjectModel>("projects", _store, new Base64ImageSanitizer(NullLogger<Base64ImageSanitizer>.Instance));
        _service = new SectionAdminService<ProjectModel>(_repository, _cache, [_removed]);
    }

    [Fact]
    public async Task Upsert_stores_a_valid_entry_under_its_derived_key_and_drops_the_cache()
    {
        var result = await _service.UpsertAsync(Json(new { projectName = "My.App", projectLink = "https://example.com" }), null);

        Assert.True(result.Succeeded);
        Assert.Equal("My_App", result.Key);
        Assert.Equal(1, _cache.Invalidations);

        var all = await _repository.GetAllAsync();
        Assert.Equal("My.App", Assert.Single(all).Value.ProjectName);
    }

    [Fact]
    public async Task Upsert_returns_field_errors_instead_of_writing_invalid_data()
    {
        var result = await _service.UpsertAsync(Json(new { projectName = "", projectLink = "javascript:alert(1)" }), null);

        Assert.False(result.Succeeded);
        Assert.Contains("projectName", result.Errors.Keys);
        Assert.Contains("projectLink", result.Errors.Keys);
        Assert.Empty(await _repository.GetAllAsync());
        Assert.Equal(0, _cache.Invalidations);
    }

    [Fact]
    public async Task Upsert_with_a_blank_name_never_touches_the_section_root()
    {
        await _service.UpsertAsync(Json(new { projectName = "Keep me" }), null);

        var result = await _service.UpsertAsync(Json(new { projectName = "   " }), null);

        Assert.False(result.Succeeded);
        Assert.Single(await _repository.GetAllAsync());
    }

    [Fact]
    public async Task Upsert_removes_the_old_key_when_an_entry_is_renamed()
    {
        await _service.UpsertAsync(Json(new { projectName = "Old name" }), null);

        var result = await _service.UpsertAsync(Json(new { projectName = "New name" }), "Old name");

        Assert.True(result.Succeeded);
        var keys = (await _repository.GetAllAsync()).Keys.Order().ToArray();
        Assert.Equal(new[] { "New name" }, keys);
    }

    [Fact]
    public async Task Upsert_rejects_malformed_json_and_malformed_original_keys()
    {
        using var malformed = JsonDocument.Parse("\"just a string\"");
        Assert.False((await _service.UpsertAsync(malformed.RootElement, null)).Succeeded);
        Assert.False((await _service.UpsertAsync(Json(new { projectName = "x" }), "bad/key")).Succeeded);
    }

    [Fact]
    public async Task Delete_removes_the_entry_runs_cleanup_handlers_and_drops_the_cache()
    {
        await _service.UpsertAsync(Json(new { projectName = "Demo", demoVideoPath = "/videos/0123456789abcdef0123456789abcdef.mp4" }), null);
        _cache.Invalidations = 0;

        await _service.DeleteAsync("Demo");

        Assert.Empty(await _repository.GetAllAsync());
        Assert.Equal(1, _cache.Invalidations);
        Assert.Equal("/videos/0123456789abcdef0123456789abcdef.mp4", Assert.Single(_removed.Removed).DemoVideoPath);
    }

    [Fact]
    public async Task Delete_rejects_keys_that_could_address_a_parent_node()
    {
        await Assert.ThrowsAsync<ArgumentException>(() => _service.DeleteAsync("../projects"));
        await Assert.ThrowsAsync<ArgumentException>(() => _service.DeleteAsync(string.Empty));
    }

    [Fact]
    public void Registry_resolves_sections_by_name_case_insensitively()
    {
        var registry = new SectionRegistry([_service]);

        Assert.True(registry.TryGet("Projects", out var found));
        Assert.Same(_service, found);
        Assert.False(registry.TryGet("nope", out _));
        Assert.False(registry.TryGet(string.Empty, out _));
    }

    private static readonly JsonSerializerOptions WebJson = new(JsonSerializerDefaults.Web);

    private static JsonElement Json(object value) => JsonSerializer.SerializeToElement(value, WebJson);

    private sealed class RecordingCache : IPortfolioCache
    {
        public int Invalidations { get; set; }

        public void Invalidate() => Invalidations++;
    }

    private sealed class RecordingRemovedHandler : IEntryRemovedHandler<ProjectModel>
    {
        public List<ProjectModel> Removed { get; } = [];

        public Task OnRemovedAsync(ProjectModel entry, CancellationToken cancellationToken = default)
        {
            Removed.Add(entry);
            return Task.CompletedTask;
        }
    }
}
