namespace sauraav_portfolio_site.Services
{
    using Firebase.Database;
    using Firebase.Database.Query;
    using Microsoft.Extensions.Logging;
    using sauraav_portfolio_site.Models;

    public class FirebaseService
    {
        private readonly FirebaseClient _firebaseClient;
        private readonly ILogger<FirebaseService> _logger;
        private const string FirebaseUrl = "https://sauraav-portfolio-site-default-rtdb.europe-west1.firebasedatabase.app/";

        public FirebaseService(ILogger<FirebaseService> logger)
        {
            _firebaseClient = new FirebaseClient(FirebaseUrl);
            _logger = logger;
        }

        public async Task<T> GetData<T>(string node)
        {
            try
            {
                var result = await _firebaseClient.Child(node).OnceSingleAsync<T>();

                // Handle base64 image data based on type
                if (result is Dictionary<string, EducationModel> educationDict)
                {
                    foreach (var edu in educationDict.Values)
                    {
                        edu.ImageBase64 = CleanBase64String(edu.ImageBase64);
                    }
                }
                else if (result is Dictionary<string, WorkExperienceModel> experienceDict)
                {
                    foreach (var exp in experienceDict.Values)
                    {
                        exp.ImageBase64 = CleanBase64String(exp.ImageBase64);
                    }
                }
                else if (result is Dictionary<string, QualificationModel> qualificationDict)
                {
                    foreach (var qual in qualificationDict.Values)
                    {
                        qual.ImageBase64 = CleanBase64String(qual.ImageBase64);
                    }
                }

                return result;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error getting data from node: {node}");
                throw;
            }
        }

        private string CleanBase64String(string base64String)
        {
            if (string.IsNullOrEmpty(base64String))
                return null;

            try
            {
                // Remove any whitespace
                base64String = base64String.Trim();

                // Remove data:image/[type];base64, if it exists
                if (base64String.Contains(","))
                {
                    base64String = base64String.Split(',')[1];
                }

                // Remove any invalid characters
                base64String = base64String.Replace("\n", "").Replace("\r", "");

                // Validate that it's a valid base64 string
                try
                {
                    var bytes = Convert.FromBase64String(base64String);
                    return base64String;
                }
                catch
                {
                    _logger.LogWarning($"Invalid base64 string detected");
                    return null;
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error cleaning base64 string");
                return null;
            }
        }

        public async Task SetData<T>(string node, T data)
        {
            await _firebaseClient.Child(node).PutAsync(data);
        }

        public async Task DeleteData(string node)
        {
            await _firebaseClient.Child(node).DeleteAsync();
        }
    }
}