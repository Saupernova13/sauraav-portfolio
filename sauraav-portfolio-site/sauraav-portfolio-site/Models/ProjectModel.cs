namespace sauraav_portfolio_site.Models
{
    public class ProjectModel
    {
        public ProjectModel()
        {
            ProjectName = "";
            Description = "";
            ProjectLink = "";
            DemoVideoPath = "";
        }

        public int Id { get; set; }
        public string ProjectName { get; set; }
        public string Description { get; set; }
        public string ProjectLink { get; set; }
        public string DemoVideoPath { get; set; }
    }
}
