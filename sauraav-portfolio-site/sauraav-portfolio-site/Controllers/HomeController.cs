using Microsoft.AspNetCore.Mvc;
using sauraav_portfolio_site.Models;
using sauraav_portfolio_site.Services;
using System.Diagnostics;

namespace sauraav_portfolio_site.Controllers
{
    public class HomeController : Controller
    {
        private readonly ILogger<HomeController> _logger;
        private readonly FirebaseService _firebaseService;

        public HomeController(ILogger<HomeController> logger, FirebaseService firebaseService)
        {
            _logger = logger;
            _firebaseService = firebaseService;
        }

        public async Task<IActionResult> Index()
        {
            try
            {
                var viewModel = new PortfolioViewModel
                {
                    Summary = await _firebaseService.GetData<SummaryModel>("summary"),
                    Education = await _firebaseService.GetData<Dictionary<string, EducationModel>>("education"),
                    Experience = await _firebaseService.GetData<Dictionary<string, WorkExperienceModel>>("experience"),
                    Projects = await _firebaseService.GetData<Dictionary<string, ProjectModel>>("projects"),
                    Qualifications = await _firebaseService.GetData<Dictionary<string, QualificationModel>>("qualifications"),
                    Skills = await _firebaseService.GetData<Dictionary<string, SkillsModel>>("skills")
                };

                return View(viewModel);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching portfolio data");
                return View("Error");
            }
        }

        [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
        public IActionResult Error()
        {
            return View(new ErrorViewModel { RequestId = Activity.Current?.Id ?? HttpContext.TraceIdentifier });
        }
    }
}