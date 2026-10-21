namespace sauraav_portfolio_site.Services.Sections;

/// <summary>Looks up keyed sections by their public name.</summary>
public interface ISectionRegistry
{
    IReadOnlyCollection<ISectionAdmin> All { get; }

    bool TryGet(string sectionName, out ISectionAdmin section);
}
