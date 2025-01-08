namespace sauraav_portfolio_site.Models
{
    public class WorkExperienceModel
    {
        public WorkExperienceModel()
        {
            // Initialize properties to prevent null reference exceptions
            Title = "";
            Location = "";
            Accomplishments = new List<string>();
            ImageBase64 = "";
        }

        public int Id { get; set; }
        public string Title { get; set; }
        public string Location { get; set; }
        public List<string> Accomplishments { get; set; }
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public string ImageBase64 { get; set; }
    }
}