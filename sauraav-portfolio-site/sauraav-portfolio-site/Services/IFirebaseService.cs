namespace sauraav_portfolio_site.Services;

public interface IFirebaseService
{
    Task<T> GetData<T>(string node);
    Task SetData<T>(string node, T data);
    Task DeleteData(string node);
}
