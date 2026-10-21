namespace sauraav_portfolio_site.Services.Firebase;

/// <summary>Thin transport over the Firebase Realtime Database. Callers own the node layout.</summary>
public interface IFirebaseService
{
    /// <summary>Reads a node. Returns <see langword="null"/> when the node does not exist.</summary>
    Task<T?> GetData<T>(string node, CancellationToken cancellationToken = default);

    Task SetData<T>(string node, T data, CancellationToken cancellationToken = default);

    Task DeleteData(string node, CancellationToken cancellationToken = default);
}
