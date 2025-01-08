using Microsoft.AspNetCore.Mvc;
using sauraav_portfolio_site.Models;
using sauraav_portfolio_site.Services;
using System.Text.Json;
using System.Threading.Tasks;

public class AdminController : Controller
{
    private readonly FirebaseService _firebaseService;

    public AdminController(FirebaseService firebaseService)
    {
        _firebaseService = firebaseService;
    }

    public IActionResult Index()
    {
        return View();
    }

    // Summary Actions
    [HttpPost]
    public async Task<IActionResult> SaveSummary([FromBody] SummaryModel summary)
    {
        try
        {
            await _firebaseService.SetData("summary", summary);
            return Json(new { success = true });
        }
        catch (Exception ex)
        {
            return Json(new { success = false, message = ex.Message });
        }
    }

    // Education Actions
    [HttpPost]
    public async Task<IActionResult> AddEducation([FromBody] EducationModel education)
    {
        try
        {
            string nodePath = $"education/{education.SchoolName}";
            await _firebaseService.SetData(nodePath, education);
            return Json(new { success = true });
        }
        catch (Exception ex)
        {
            return Json(new { success = false, message = ex.Message });
        }
    }

    [HttpDelete]
    public async Task<IActionResult> DeleteEducation(string schoolName)
    {
        try
        {
            await _firebaseService.DeleteData($"education/{schoolName}");
            return Json(new { success = true });
        }
        catch (Exception ex)
        {
            return Json(new { success = false, message = ex.Message });
        }
    }

    // Experience Actions
    [HttpPost]
    public async Task<IActionResult> AddExperience([FromBody] WorkExperienceModel experience)
    {
        try
        {
            string nodePath = $"experience/{experience.Title}";
            await _firebaseService.SetData(nodePath, experience);
            return Json(new { success = true });
        }
        catch (Exception ex)
        {
            return Json(new { success = false, message = ex.Message });
        }
    }

    [HttpDelete]
    public async Task<IActionResult> DeleteExperience(string title)
    {
        try
        {
            await _firebaseService.DeleteData($"experience/{title}");
            return Json(new { success = true });
        }
        catch (Exception ex)
        {
            return Json(new { success = false, message = ex.Message });
        }
    }

    [HttpPost]
    public async Task<IActionResult> AddProject([FromForm] IFormFile video, [FromForm] string projectData)
    {
        try
        {
            // Deserialize the project data
            var project = JsonSerializer.Deserialize<ProjectModel>(projectData, new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true
            });

            if (project == null)
            {
                return Json(new { success = false, message = "Invalid project data" });
            }

            // Sanitize project name for Firebase path
            string sanitizedProjectName = project.ProjectName
                .Replace("/", "_")
                .Replace(".", "_")
                .Replace("#", "_")
                .Replace("$", "_")
                .Replace("[", "_")
                .Replace("]", "_");

            if (video != null)
            {
                // Save the video and get the path
                string videoPath = await SaveVideo(video);
                project.DemoVideoPath = videoPath;
            }

            string nodePath = $"projects/{sanitizedProjectName}";
            await _firebaseService.SetData(nodePath, new
            {
                projectName = project.ProjectName,
                description = project.Description,
                projectLink = project.ProjectLink,
                demoVideoPath = project.DemoVideoPath
            });

            return Json(new { success = true });
        }
        catch (Exception ex)
        {
            return Json(new { success = false, message = ex.Message });
        }
    }   

    [HttpDelete]
    public async Task<IActionResult> DeleteProject(string projectName)
    {
        try
        {
            await _firebaseService.DeleteData($"projects/{projectName}");
            return Json(new { success = true });
        }
        catch (Exception ex)
        {
            return Json(new { success = false, message = ex.Message });
        }
    }

    // Qualification Actions
    [HttpPost]
    public async Task<IActionResult> AddQualification([FromBody] QualificationModel qualification)
    {
        try
        {
            string nodePath = $"qualifications/{qualification.QualificationName}";
            await _firebaseService.SetData(nodePath, qualification);
            return Json(new { success = true });
        }
        catch (Exception ex)
        {
            return Json(new { success = false, message = ex.Message });
        }
    }

    [HttpDelete]
    public async Task<IActionResult> DeleteQualification(string qualificationName)
    {
        try
        {
            await _firebaseService.DeleteData($"qualifications/{qualificationName}");
            return Json(new { success = true });
        }
        catch (Exception ex)
        {
            return Json(new { success = false, message = ex.Message });
        }
    }

    // Skills Actions
    [HttpPost]
    public async Task<IActionResult> AddSkill([FromBody] SkillsModel skill)
    {
        try
        {
            string nodePath = $"skills/{skill.SkillName}";
            await _firebaseService.SetData(nodePath, skill);
            return Json(new { success = true });
        }
        catch (Exception ex)
        {
            return Json(new { success = false, message = ex.Message });
        }
    }

    [HttpDelete]
    public async Task<IActionResult> DeleteSkill(string skillName)
    {
        try
        {
            await _firebaseService.DeleteData($"skills/{skillName}");
            return Json(new { success = true });
        }
        catch (Exception ex)
        {
            return Json(new { success = false, message = ex.Message });
        }
    }

    // Get All Data
    [HttpGet]
    public async Task<IActionResult> GetAllData()
    {
        try
        {
            var summary = await _firebaseService.GetData<SummaryModel>("summary");
            var education = await _firebaseService.GetData<Dictionary<string, EducationModel>>("education");
            var experience = await _firebaseService.GetData<Dictionary<string, WorkExperienceModel>>("experience");
            var projects = await _firebaseService.GetData<Dictionary<string, ProjectModel>>("projects");
            var qualifications = await _firebaseService.GetData<Dictionary<string, QualificationModel>>("qualifications");
            var skills = await _firebaseService.GetData<Dictionary<string, SkillsModel>>("skills");

            return Json(new
            {
                summary,
                education,
                experience,
                projects,
                qualifications,
                skills
            });
        }
        catch (Exception ex)
        {
            return Json(new { success = false, message = ex.Message });
        }
    }

    private async Task<string> SaveVideo(IFormFile video)
    {
        if (video == null || video.Length == 0)
            return null;

        // Create videos directory if it doesn't exist
        var uploadsFolder = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "videos");
        if (!Directory.Exists(uploadsFolder))
            Directory.CreateDirectory(uploadsFolder);

        // Generate unique filename
        var uniqueFileName = $"{Guid.NewGuid()}_{video.FileName}";
        var filePath = Path.Combine(uploadsFolder, uniqueFileName);

        // Save the file
        using (var fileStream = new FileStream(filePath, FileMode.Create))
        {
            await video.CopyToAsync(fileStream);
        }

        // Return the relative path
        return $"/videos/{uniqueFileName}";
    }
}