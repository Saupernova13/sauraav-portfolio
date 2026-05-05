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
    private static readonly JsonSerializerOptions CaseInsensitiveOptions = new() { PropertyNameCaseInsensitive = true };

    private readonly IFirebaseService _firebase;

    public AdminController(IFirebaseService firebase) => _firebase = firebase;

    public IActionResult Index() => View();

    // Summary

    [HttpPost]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> SaveSummary([FromBody] SummaryModel summary)
    {
        await _firebase.SetData("summary", summary);
        return Json(new { success = true });
    }

    // Education

    [HttpPost]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> AddEducation([FromBody] EducationModel education)
    {
        var key = FirebaseKeySanitizer.Sanitize(education.SchoolName ?? string.Empty);
        await _firebase.SetData($"education/{key}", education);
        return Json(new { success = true });
    }

    [HttpDelete]
    public async Task<IActionResult> DeleteEducation(string schoolName)
    {
        await _firebase.DeleteData($"education/{FirebaseKeySanitizer.Sanitize(schoolName)}");
        return Json(new { success = true });
    }

    // Experience

    [HttpPost]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> AddExperience([FromBody] WorkExperienceModel experience)
    {
        var key = FirebaseKeySanitizer.Sanitize(experience.Title ?? string.Empty);
        await _firebase.SetData($"experience/{key}", experience);
        return Json(new { success = true });
    }

    [HttpDelete]
    public async Task<IActionResult> DeleteExperience(string title)
    {
        await _firebase.DeleteData($"experience/{FirebaseKeySanitizer.Sanitize(title)}");
        return Json(new { success = true });
    }

    // Projects

    [HttpPost]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> AddProject([FromForm] IFormFile? video, [FromForm] string projectData)
    {
        var project = JsonSerializer.Deserialize<ProjectModel>(projectData, CaseInsensitiveOptions);

        if (project is null)
            return Json(new { success = false, message = "Invalid project data" });

        if (video is not null)
            project.DemoVideoPath = await SaveVideoAsync(video);

        var key = FirebaseKeySanitizer.Sanitize(project.ProjectName ?? string.Empty);
        await _firebase.SetData($"projects/{key}", new
        {
            projectName = project.ProjectName,
            description = project.Description,
            projectLink = project.ProjectLink,
            demoVideoPath = project.DemoVideoPath,
        });

        return Json(new { success = true });
    }

    [HttpDelete]
    public async Task<IActionResult> DeleteProject(string projectName)
    {
        await _firebase.DeleteData($"projects/{FirebaseKeySanitizer.Sanitize(projectName)}");
        return Json(new { success = true });
    }

    // Qualifications

    [HttpPost]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> AddQualification([FromBody] QualificationModel qualification)
    {
        var key = FirebaseKeySanitizer.Sanitize(qualification.QualificationName ?? string.Empty);
        await _firebase.SetData($"qualifications/{key}", qualification);
        return Json(new { success = true });
    }

    [HttpDelete]
    public async Task<IActionResult> DeleteQualification(string qualificationName)
    {
        await _firebase.DeleteData($"qualifications/{FirebaseKeySanitizer.Sanitize(qualificationName)}");
        return Json(new { success = true });
    }

    // Skills

    [HttpPost]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> AddSkill([FromBody] SkillsModel skill)
    {
        var key = FirebaseKeySanitizer.Sanitize(skill.SkillName ?? string.Empty);
        await _firebase.SetData($"skills/{key}", skill);
        return Json(new { success = true });
    }

    [HttpDelete]
    public async Task<IActionResult> DeleteSkill(string skillName)
    {
        await _firebase.DeleteData($"skills/{FirebaseKeySanitizer.Sanitize(skillName)}");
        return Json(new { success = true });
    }

    // Data

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

    private static async Task<string> SaveVideoAsync(IFormFile video)
    {
        var uploadsFolder = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "videos");
        Directory.CreateDirectory(uploadsFolder);

        var uniqueFileName = $"{Guid.NewGuid()}_{Path.GetFileName(video.FileName)}";
        var filePath = Path.Combine(uploadsFolder, uniqueFileName);

        await using var stream = new FileStream(filePath, FileMode.Create);
        await video.CopyToAsync(stream);

        return $"/videos/{uniqueFileName}";
    }
}
