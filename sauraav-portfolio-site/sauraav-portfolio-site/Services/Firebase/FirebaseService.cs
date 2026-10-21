using Firebase.Database;
using Firebase.Database.Query;
using Google.Apis.Auth.OAuth2;
using Microsoft.Extensions.Options;

namespace sauraav_portfolio_site.Services.Firebase;

public sealed class FirebaseService : IFirebaseService, IDisposable
{
    private static readonly string[] DatabaseScopes =
    [
        "https://www.googleapis.com/auth/firebase.database",
        "https://www.googleapis.com/auth/userinfo.email",
    ];

    private static readonly Action<ILogger, Exception?> LogAnonymousAccess = LoggerMessage.Define(
        LogLevel.Warning,
        new EventId(1, "FirebaseAnonymous"),
        "Firebase:ServiceAccountJsonPath is not set; the database is accessed anonymously and its rules must allow it");

    private readonly FirebaseClient _client;

    public FirebaseService(IOptions<Models.FirebaseOptions> options, ILogger<FirebaseService> logger)
    {
        var settings = options.Value;
        var clientOptions = new global::Firebase.Database.FirebaseOptions();

        if (!string.IsNullOrWhiteSpace(settings.ServiceAccountJsonPath))
        {
            var credential = GoogleCredential.FromFile(settings.ServiceAccountJsonPath).CreateScoped(DatabaseScopes);
            clientOptions.AsAccessToken = true;
            clientOptions.AuthTokenAsyncFactory = () => credential.UnderlyingCredential.GetAccessTokenForRequestAsync();
        }
        else
        {
            LogAnonymousAccess(logger, null);
        }

        _client = new FirebaseClient(settings.DatabaseUrl, clientOptions);
    }

    public async Task<T?> GetData<T>(string node, CancellationToken cancellationToken = default)
    {
        cancellationToken.ThrowIfCancellationRequested();
        return await _client.Child(node).OnceSingleAsync<T>();
    }

    public async Task SetData<T>(string node, T data, CancellationToken cancellationToken = default)
    {
        cancellationToken.ThrowIfCancellationRequested();
        await _client.Child(node).PutAsync(data);
    }

    public async Task DeleteData(string node, CancellationToken cancellationToken = default)
    {
        cancellationToken.ThrowIfCancellationRequested();
        await _client.Child(node).DeleteAsync();
    }

    public void Dispose() => _client.Dispose();
}
