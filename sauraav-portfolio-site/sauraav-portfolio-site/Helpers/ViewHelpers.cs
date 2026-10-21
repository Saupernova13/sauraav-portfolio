using System.Globalization;

namespace sauraav_portfolio_site.Helpers;

public static class ViewHelpers
{
    public static string FormatDate(string? date)
    {
        if (string.IsNullOrEmpty(date))
        {
            return string.Empty;
        }

        return DateTime.TryParse(date, CultureInfo.InvariantCulture, DateTimeStyles.AssumeUniversal, out var parsed)
            ? parsed.ToString("MMM yyyy", CultureInfo.InvariantCulture)
            : date;
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
}
