using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using sauraav_portfolio_site.Filters;
using sauraav_portfolio_site.Helpers;
using sauraav_portfolio_site.Models;
using sauraav_portfolio_site.Services;
using System.Text.Json;

namespace sauraav_portfolio_site.Controllers;

[Authorize]
[ServiceFilter(typeof(ApiExceptionFilter))]
public sealed class AdminController : Controller
{
    private const long MaxVideoBytes = 100 * 1024 * 1024;

    private static readonly JsonSerializerOptions CaseInsensitiveOptions = new() { PropertyNameCaseInsensitive = true };

    private static readonly HashSet<string> DeletableSections =
        new(StringComparer.OrdinalIgnoreCase) { "education", "experience", "projects", "qualifications", "skills" };

    private static readonly HashSet<string> AllowedVideoExtensions =
        new(StringComparer.OrdinalIgnoreCase) { ".mp4", ".webm", ".gif" };

    private readonly IFirebaseService _firebase;

    public AdminController(IFirebaseService firebase) => _firebase = firebase;

    public IActionResult Index() => View();

    [HttpPost]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> SaveSummary([FromBody] SummaryModel summary)
    {
        if (!ModelState.IsValid)
            return ValidationFailure();

        await _firebase.SetData("summary", summary);
        return Json(new { success = true });
    }

    [HttpPost]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> AddEducation([FromBody] EducationModel education) =>
        await SaveKeyedAsync("education", education.SchoolName, education);

    [HttpPost]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> AddExperience([FromBody] WorkExperienceModel experience) =>
        await SaveKeyedAsync("experience", experience.Title, experience);

    [HttpPost]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> AddQualification([FromBody] QualificationModel qualification) =>
        await SaveKeyedAsync("qualifications", qualification.QualificationName, qualification);

    [HttpPost]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> AddSkill([FromBody] SkillsModel skill) =>
        await SaveKeyedAsync("skills", skill.SkillName, skill);

    [HttpPost]
    [ValidateAntiForgeryToken]
    [RequestSizeLimit(MaxVideoBytes + 1024 * 1024)]
    public async Task<IActionResult> AddProject([FromForm] IFormFile? video, [FromForm] string projectData)
    {
        var project = JsonSerializer.Deserialize<ProjectModel>(projectData, CaseInsensitiveOptions);

        if (project is null || !TryValidateModel(project))
            return Json(new { success = false, message = "Invalid project data" });

        if (video is not null)
        {
            var extension = Path.GetExtension(video.FileName);
            if (!AllowedVideoExtensions.Contains(extension))
                return Json(new { success = false, message = "Only .mp4, .webm and .gif files are allowed" });

            if (video.Length > MaxVideoBytes)
                return Json(new { success = false, message = "Video exceeds the 100 MB limit" });

            project.DemoVideoPath = await SaveVideoAsync(video, extension);
        }

        return await SaveKeyedAsync("projects", project.ProjectName, project);
    }

    [HttpDelete]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> Delete(string section, string key)
    {
        if (string.IsNullOrWhiteSpace(key) || !DeletableSections.Contains(section))
            return Json(new { success = false, message = "Unknown section or empty key" });

        await _firebase.DeleteData($"{section.ToLowerInvariant()}/{FirebaseKeySanitizer.Sanitize(key)}");
        return Json(new { success = true });
    }

    [HttpGet]
    public async Task<IActionResult> GetAllData()
    {
        var summary = _firebase.GetData<SummaryModel>("summary");
        var education = _firebase.GetData<Dictionary<string, EducationModel>>("education");
        var experience = _firebase.GetData<Dictionary<string, WorkExperienceModel>>("experience");
        var projects = _firebase.GetData<Dictionary<string, ProjectModel>>("projects");
        var qualifications = _firebase.GetData<Dictionary<string, QualificationModel>>("qualifications");
        var skills = _firebase.GetData<Dictionary<string, SkillsModel>>("skills");

        await Task.WhenAll(summary, education, experience, projects, qualifications, skills);

        return Json(new
        {
            summary = await summary,
            education = await education,
            experience = await experience,
            projects = await projects,
            qualifications = await qualifications,
            skills = await skills,
        });
    }

    private async Task<IActionResult> SaveKeyedAsync<T>(string section, string? key, T data)
    {
        if (!ModelState.IsValid || string.IsNullOrWhiteSpace(key))
            return ValidationFailure();

        await _firebase.SetData($"{section}/{FirebaseKeySanitizer.Sanitize(key)}", data);
        return Json(new { success = true });
    }

    private JsonResult ValidationFailure()
    {
        var errors = ModelState.Values
            .SelectMany(v => v.Errors)
            .Select(e => e.ErrorMessage)
            .DefaultIfEmpty("Invalid data")
            .First();

        return Json(new { success = false, message = errors });
    }

    private static async Task<string> SaveVideoAsync(IFormFile video, string extension)
    {
        var uploadsFolder = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "videos");
        Directory.CreateDirectory(uploadsFolder);

        var uniqueFileName = $"{Guid.NewGuid()}{extension.ToLowerInvariant()}";
        var filePath = Path.Combine(uploadsFolder, uniqueFileName);

        await using var stream = new FileStream(filePath, FileMode.Create);
        await video.CopyToAsync(stream);

        return $"/videos/{uniqueFileName}";
    }
}
