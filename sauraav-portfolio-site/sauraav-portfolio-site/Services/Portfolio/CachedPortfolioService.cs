using Microsoft.Extensions.Caching.Memory;
using sauraav_portfolio_site.Models;

namespace sauraav_portfolio_site.Services.Portfolio;

/// <summary>
/// Decorates <see cref="IPortfolioService"/> with a short in-memory cache that admin writes can drop.
/// Concurrent misses share one upstream fetch.
/// </summary>
public sealed class CachedPortfolioService : IPortfolioService, IPortfolioCache, IDisposable
{
    public static readonly TimeSpan DefaultTtl = TimeSpan.FromMinutes(10);

    private const string CacheKey = "portfolio";

    private readonly IPortfolioService _inner;
    private readonly IMemoryCache _cache;
    private readonly TimeSpan _ttl;
    private readonly SemaphoreSlim _gate = new(1, 1);

    public CachedPortfolioService(IPortfolioService inner, IMemoryCache cache)
        : this(inner, cache, DefaultTtl)
    {
    }

    public CachedPortfolioService(IPortfolioService inner, IMemoryCache cache, TimeSpan ttl)
    {
        _inner = inner;
        _cache = cache;
        _ttl = ttl;
    }

    public async Task<PortfolioViewModel> GetPortfolioAsync(CancellationToken cancellationToken = default)
    {
        if (_cache.TryGetValue(CacheKey, out PortfolioViewModel? cached) && cached is not null)
        {
            return cached;
        }

        await _gate.WaitAsync(cancellationToken);
        try
        {
            if (_cache.TryGetValue(CacheKey, out cached) && cached is not null)
            {
                return cached;
            }

            var fresh = await _inner.GetPortfolioAsync(cancellationToken);
            _cache.Set(CacheKey, fresh, _ttl);
            return fresh;
        }
        finally
        {
            _gate.Release();
        }
    }

    public void Invalidate() => _cache.Remove(CacheKey);

    public void Dispose() => _gate.Dispose();
}
