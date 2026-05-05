namespace sauraav_portfolio_site.Helpers;

public static class ViewHelpers
{
    public static string FormatDate(string? date)
    {
        if (string.IsNullOrEmpty(date)) return string.Empty;
        return DateTime.TryParse(date, out var parsed) ? parsed.ToString("MMM yyyy", System.Globalization.CultureInfo.InvariantCulture) : date;
    }

    public static string FormatDateRange(string? start, string? end)
    {
        var s = FormatDate(start);
        var e = FormatDate(end);
        return (string.IsNullOrEmpty(s), string.IsNullOrEmpty(e)) switch
        {
            (true, true) => string.Empty,
            (true, false) => e,
            (false, true) => s,
            _ => $"{s} - {e}",
        };
    }

    public static string GetBase64ImageSrc(string? base64) =>
        string.IsNullOrEmpty(base64) ? string.Empty : $"data:image/jpeg;base64,{base64.Trim()}";
}
