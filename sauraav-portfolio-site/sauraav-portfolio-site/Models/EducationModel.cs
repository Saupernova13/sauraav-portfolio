namespace sauraav_portfolio_site.Models
{
    public class EducationModel
    {
        public int Id { get; set; }
        public string SchoolName { get; set; }
        public string Description { get; set; }
        public string Location { get; set; }
        public DateTime? StartDate { get; set; }  // Made nullable
        public DateTime? EndDate { get; set; }    // Made nullable
        public string ImageBase64 { get; set; }
    }
}
