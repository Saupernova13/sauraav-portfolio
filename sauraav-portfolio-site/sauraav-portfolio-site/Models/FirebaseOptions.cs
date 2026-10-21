using System.ComponentModel.DataAnnotations;

namespace sauraav_portfolio_site.Models;

/// <summary>Connection settings for the Firebase Realtime Database.</summary>
public sealed class FirebaseOptions
{
    public const string SectionName = "Firebase";

    /// <summary>Realtime Database URL. When empty the app runs against an in-memory store.</summary>
    public string DatabaseUrl { get; set; } = string.Empty;

    public bool IsConfigured => !string.IsNullOrWhiteSpace(DatabaseUrl);

    /// <summary>
    /// Optional path to a service-account JSON file. When set, requests are authenticated
    /// with an OAuth2 access token so database rules can deny anonymous writes.
    /// </summary>
    public string? ServiceAccountJsonPath { get; set; }
}
