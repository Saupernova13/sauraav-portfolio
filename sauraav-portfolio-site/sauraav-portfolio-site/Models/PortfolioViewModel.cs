namespace sauraav_portfolio_site.Models;

public sealed class PortfolioViewModel
{
    public SummaryModel? Summary { get; init; }
    public IReadOnlyDictionary<string, EducationModel>? Education { get; init; }
    public IReadOnlyDictionary<string, WorkExperienceModel>? Experience { get; init; }
    public IReadOnlyDictionary<string, ProjectModel>? Projects { get; init; }
    public IReadOnlyDictionary<string, QualificationModel>? Qualifications { get; init; }
    public IReadOnlyDictionary<string, SkillsModel>? Skills { get; init; }

    /// <summary>Finds the entry that owns an image, by section name and storage key.</summary>
    public IHasImage? FindImageEntry(string section, string key)
    {
        return section switch
        {
            PortfolioSections.Education => Lookup(Education, key),
            PortfolioSections.Experience => Lookup(Experience, key),
            PortfolioSections.Qualifications => Lookup(Qualifications, key),
            _ => null,
        };
    }

    private static IHasImage? Lookup<T>(IReadOnlyDictionary<string, T>? entries, string key) where T : IHasImage =>
        entries is not null && entries.TryGetValue(key, out var entry) ? entry : null;
}
