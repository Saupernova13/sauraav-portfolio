using sauraav_portfolio_site.Models;
using sauraav_portfolio_site.Services.Firebase;

namespace sauraav_portfolio_site.Services.Sections;

public sealed class FirebaseSummaryRepository : ISummaryRepository
{
    private readonly IFirebaseService _firebase;

    public FirebaseSummaryRepository(IFirebaseService firebase) => _firebase = firebase;

    public Task<SummaryModel?> GetAsync(CancellationToken cancellationToken = default) =>
        _firebase.GetData<SummaryModel>(PortfolioSections.Summary, cancellationToken);

    public Task SaveAsync(SummaryModel summary, CancellationToken cancellationToken = default) =>
        _firebase.SetData(PortfolioSections.Summary, summary, cancellationToken);
}
