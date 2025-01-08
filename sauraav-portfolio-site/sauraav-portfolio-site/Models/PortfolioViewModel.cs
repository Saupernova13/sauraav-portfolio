// Models/PortfolioViewModel.cs
namespace sauraav_portfolio_site.Models
{
    public class PortfolioViewModel
    {
        public SummaryModel Summary { get; set; }
        public Dictionary<string, EducationModel> Education { get; set; }
        public Dictionary<string, WorkExperienceModel> Experience { get; set; }
        public Dictionary<string, ProjectModel> Projects { get; set; }
        public Dictionary<string, QualificationModel> Qualifications { get; set; }
        public Dictionary<string, SkillsModel> Skills { get; set; }
    }
}