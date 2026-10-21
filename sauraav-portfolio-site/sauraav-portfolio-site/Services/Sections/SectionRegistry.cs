namespace sauraav_portfolio_site.Services.Sections;

public sealed class SectionRegistry : ISectionRegistry
{
    private readonly Dictionary<string, ISectionAdmin> _sections;

    public SectionRegistry(IEnumerable<ISectionAdmin> sections)
    {
        _sections = sections.ToDictionary(s => s.SectionName, StringComparer.OrdinalIgnoreCase);
    }

    public IReadOnlyCollection<ISectionAdmin> All => _sections.Values;

    public bool TryGet(string sectionName, out ISectionAdmin section)
    {
        if (!string.IsNullOrEmpty(sectionName) && _sections.TryGetValue(sectionName, out var found))
        {
            section = found;
            return true;
        }

        section = null!;
        return false;
    }
}
