using Microsoft.Extensions.Caching.Memory;
using sauraav_portfolio_site.Models;

namespace sauraav_portfolio_site.Services;

public sealed class PortfolioService : IPortfolioService
{
    private const string CacheKey = "portfolio_data";
    private static readonly TimeSpan CacheTtl = TimeSpan.FromSeconds(60);

    private readonly IFirebaseService _firebase;
    private readonly IMemoryCache _cache;

    public PortfolioService(IFirebaseService firebase, IMemoryCache cache)
    {
        _firebase = firebase;
        _cache = cache;
    }

    public async Task<PortfolioViewModel> GetPortfolioAsync()
    {
        if (_cache.TryGetValue(CacheKey, out PortfolioViewModel? cached) && cached is not null)
            return cached;

        var (summary, education, experience, projects, qualifications, skills) = await FetchAllAsync();

        var viewModel = new PortfolioViewModel
        {
            Summary = summary,
            Education = education,
            Experience = experience,
            Projects = projects,
            Qualifications = qualifications,
            Skills = skills,
        };

        _cache.Set(CacheKey, viewModel, CacheTtl);
        return viewModel;
    }

    private async Task<(
        SummaryModel?,
        Dictionary<string, EducationModel>?,
        Dictionary<string, WorkExperienceModel>?,
        Dictionary<string, ProjectModel>?,
        Dictionary<string, QualificationModel>?,
        Dictionary<string, SkillsModel>?)> FetchAllAsync()
    {
        var summaryTask = _firebase.GetData<SummaryModel>("summary");
        var educationTask = _firebase.GetData<Dictionary<string, EducationModel>>("education");
        var experienceTask = _firebase.GetData<Dictionary<string, WorkExperienceModel>>("experience");
        var projectsTask = _firebase.GetData<Dictionary<string, ProjectModel>>("projects");
        var qualificationsTask = _firebase.GetData<Dictionary<string, QualificationModel>>("qualifications");
        var skillsTask = _firebase.GetData<Dictionary<string, SkillsModel>>("skills");

        await Task.WhenAll(summaryTask, educationTask, experienceTask, projectsTask, qualificationsTask, skillsTask);

        return (
            await summaryTask,
            await educationTask,
            await experienceTask,
            await projectsTask,
            await qualificationsTask,
            await skillsTask
        );
    }
}
