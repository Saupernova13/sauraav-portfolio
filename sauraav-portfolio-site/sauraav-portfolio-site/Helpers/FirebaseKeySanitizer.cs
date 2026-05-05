namespace sauraav_portfolio_site.Helpers;

public static class FirebaseKeySanitizer
{
    private static readonly char[] InvalidChars = ['/', '.', '#', '$', '[', ']'];

    public static string Sanitize(string key) =>
        string.Concat(key.Select(c => Array.IndexOf(InvalidChars, c) >= 0 ? '_' : c));
}
