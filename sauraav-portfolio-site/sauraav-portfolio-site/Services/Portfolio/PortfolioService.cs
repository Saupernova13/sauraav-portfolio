using sauraav_portfolio_site.Models;
using sauraav_portfolio_site.Services.Sections;

namespace sauraav_portfolio_site.Services.Portfolio;

/// <summary>Assembles the public view model from the section repositories. Uncached.</summary>
public sealed class PortfolioService : IPortfolioService
{
    private readonly ISummaryRepository _summary;
    private readonly IPortfolioSectionRepository<EducationModel> _education;
    private readonly IPortfolioSectionRepository<WorkExperienceModel> _experience;
    private readonly IPortfolioSectionRepository<ProjectModel> _projects;
    private readonly IPortfolioSectionRepository<QualificationModel> _qualifications;
    private readonly IPortfolioSectionRepository<SkillsModel> _skills;

    public PortfolioService(
        ISummaryRepository summary,
        IPortfolioSectionRepository<EducationModel> education,
        IPortfolioSectionRepository<WorkExperienceModel> experience,
        IPortfolioSectionRepository<ProjectModel> projects,
        IPortfolioSectionRepository<QualificationModel> qualifications,
        IPortfolioSectionRepository<SkillsModel> skills)
    {
        _summary = summary;
        _education = education;
        _experience = experience;
        _projects = projects;
        _qualifications = qualifications;
        _skills = skills;
    }

    public async Task<PortfolioViewModel> GetPortfolioAsync(CancellationToken cancellationToken = default)
    {
        var summaryTask = _summary.GetAsync(cancellationToken);
        var educationTask = _education.GetAllAsync(cancellationToken);
        var experienceTask = _experience.GetAllAsync(cancellationToken);
        var projectsTask = _projects.GetAllAsync(cancellationToken);
        var qualificationsTask = _qualifications.GetAllAsync(cancellationToken);
        var skillsTask = _skills.GetAllAsync(cancellationToken);

        await Task.WhenAll(summaryTask, educationTask, experienceTask, projectsTask, qualificationsTask, skillsTask);

        return new PortfolioViewModel
        {
            Summary = await summaryTask,
            Education = await educationTask,
            Experience = await experienceTask,
            Projects = await projectsTask,
            Qualifications = await qualificationsTask,
            Skills = await skillsTask,
        };
    }
}
