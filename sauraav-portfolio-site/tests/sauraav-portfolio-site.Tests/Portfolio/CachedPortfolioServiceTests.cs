using Microsoft.Extensions.Caching.Memory;
using sauraav_portfolio_site.Models;
using sauraav_portfolio_site.Services.Portfolio;

namespace sauraav_portfolio_site.Tests.Portfolio;

public sealed class CachedPortfolioServiceTests
{
    [Fact]
    public async Task Repeated_reads_hit_the_inner_service_once_until_invalidated()
    {
        var inner = new CountingPortfolioService();
        using var cache = new MemoryCache(new MemoryCacheOptions());
        using var service = new CachedPortfolioService(inner, cache);

        var first = await service.GetPortfolioAsync();
        var second = await service.GetPortfolioAsync();
        Assert.Same(first, second);
        Assert.Equal(1, inner.Calls);

        service.Invalidate();
        var third = await service.GetPortfolioAsync();
        Assert.NotSame(first, third);
        Assert.Equal(2, inner.Calls);
    }

    [Fact]
    public async Task Concurrent_misses_share_a_single_fetch()
    {
        var inner = new CountingPortfolioService { Delay = TimeSpan.FromMilliseconds(50) };
        using var cache = new MemoryCache(new MemoryCacheOptions());
        using var service = new CachedPortfolioService(inner, cache);

        var results = await Task.WhenAll(Enumerable.Range(0, 8).Select(_ => service.GetPortfolioAsync()));

        Assert.Equal(1, inner.Calls);
        Assert.All(results, r => Assert.Same(results[0], r));
    }

    [Fact]
    public void FindImageEntry_locates_entries_in_image_bearing_sections_only()
    {
        var model = new PortfolioViewModel
        {
            Qualifications = new Dictionary<string, QualificationModel> { ["cert"] = new() { QualificationName = "Cert", ImageBase64 = "abc=" } },
            Skills = new Dictionary<string, SkillsModel> { ["c#"] = new() { SkillName = "C#", SkillLevel = 9 } },
        };

        Assert.NotNull(model.FindImageEntry(PortfolioSections.Qualifications, "cert"));
        Assert.Null(model.FindImageEntry(PortfolioSections.Qualifications, "missing"));
        Assert.Null(model.FindImageEntry(PortfolioSections.Skills, "c#"));
        Assert.Null(model.FindImageEntry(PortfolioSections.Education, "cert"));
    }

    private sealed class CountingPortfolioService : IPortfolioService
    {
        public int Calls { get; private set; }

        public TimeSpan Delay { get; init; }

        public async Task<PortfolioViewModel> GetPortfolioAsync(CancellationToken cancellationToken = default)
        {
            Calls++;
            if (Delay > TimeSpan.Zero)
            {
                await Task.Delay(Delay, cancellationToken);
            }

            return new PortfolioViewModel();
        }
    }
}
