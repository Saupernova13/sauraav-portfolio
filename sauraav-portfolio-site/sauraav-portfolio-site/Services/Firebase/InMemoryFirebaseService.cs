using System.Collections.Concurrent;
using System.Text.Json;

namespace sauraav_portfolio_site.Services.Firebase;

/// <summary>
/// Process-local stand-in for the Realtime Database, used when <c>Firebase:DatabaseUrl</c> is not
/// configured (local development, tests). Data is lost when the process exits.
/// </summary>
public sealed class InMemoryFirebaseService : IFirebaseService
{
    private static readonly JsonSerializerOptions JsonOptions = new(JsonSerializerDefaults.Web);

    private readonly ConcurrentDictionary<string, string> _nodes = new(StringComparer.Ordinal);

    public Task<T?> GetData<T>(string node, CancellationToken cancellationToken = default)
    {
        cancellationToken.ThrowIfCancellationRequested();
        var path = Normalise(node);

        if (_nodes.TryGetValue(path, out var json))
        {
            return Task.FromResult(JsonSerializer.Deserialize<T>(json, JsonOptions));
        }

        // A parent node is the dictionary of its direct children.
        var prefix = path + "/";
        var children = _nodes
            .Where(kv => kv.Key.StartsWith(prefix, StringComparison.Ordinal) && !kv.Key[prefix.Length..].Contains('/', StringComparison.Ordinal))
            .ToDictionary(kv => kv.Key[prefix.Length..], kv => JsonSerializer.Deserialize<JsonElement>(kv.Value, JsonOptions), StringComparer.Ordinal);

        if (children.Count == 0)
        {
            return Task.FromResult<T?>(default);
        }

        var combined = JsonSerializer.Serialize(children, JsonOptions);
        return Task.FromResult(JsonSerializer.Deserialize<T>(combined, JsonOptions));
    }

    public Task SetData<T>(string node, T data, CancellationToken cancellationToken = default)
    {
        cancellationToken.ThrowIfCancellationRequested();
        _nodes[Normalise(node)] = JsonSerializer.Serialize(data, JsonOptions);
        return Task.CompletedTask;
    }

    public Task DeleteData(string node, CancellationToken cancellationToken = default)
    {
        cancellationToken.ThrowIfCancellationRequested();
        var path = Normalise(node);
        _nodes.TryRemove(path, out _);

        var prefix = path + "/";
        foreach (var key in _nodes.Keys.Where(k => k.StartsWith(prefix, StringComparison.Ordinal)).ToList())
        {
            _nodes.TryRemove(key, out _);
        }

        return Task.CompletedTask;
    }

    private static string Normalise(string node) => node.Trim('/');
}
