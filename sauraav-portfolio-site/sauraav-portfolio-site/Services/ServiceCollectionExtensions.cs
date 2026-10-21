using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Options;
using sauraav_portfolio_site.Models;
using sauraav_portfolio_site.Services.Auth;
using sauraav_portfolio_site.Services.Firebase;
using sauraav_portfolio_site.Services.Images;
using sauraav_portfolio_site.Services.Media;
using sauraav_portfolio_site.Services.Portfolio;
using sauraav_portfolio_site.Services.Sections;

namespace sauraav_portfolio_site.Services;

public static class ServiceCollectionExtensions
{
    /// <summary>Registers storage, the portfolio sections, the cached read model and media handling.</summary>
    public static IServiceCollection AddPortfolio(this IServiceCollection services, IConfiguration configuration)
    {
        ArgumentNullException.ThrowIfNull(configuration);

        services.AddOptions<FirebaseOptions>()
            .Bind(configuration.GetSection(FirebaseOptions.SectionName))
            .ValidateDataAnnotations()
            .ValidateOnStart();

        services.AddMemoryCache();
        if (string.IsNullOrWhiteSpace(configuration[$"{FirebaseOptions.SectionName}:{nameof(FirebaseOptions.DatabaseUrl)}"]))
        {
            services.AddSingleton<IFirebaseService, InMemoryFirebaseService>();
        }
        else
        {
            services.AddSingleton<IFirebaseService, FirebaseService>();
        }

        services.AddSingleton<IImageDataSanitizer, Base64ImageSanitizer>();
        services.AddSingleton<IMediaStorage, LocalMediaStorage>();

        services.AddSingleton<ISummaryRepository, FirebaseSummaryRepository>();
        services.AddPortfolioSection<EducationModel>(PortfolioSections.Education);
        services.AddPortfolioSection<WorkExperienceModel>(PortfolioSections.Experience);
        services.AddPortfolioSection<ProjectModel>(PortfolioSections.Projects);
        services.AddPortfolioSection<QualificationModel>(PortfolioSections.Qualifications);
        services.AddPortfolioSection<SkillsModel>(PortfolioSections.Skills);
        services.AddSingleton<IEntryRemovedHandler<ProjectModel>, ProjectVideoCleanup>();
        services.AddSingleton<ISectionRegistry, SectionRegistry>();

        services.AddSingleton<PortfolioService>();
        services.AddSingleton(sp => new CachedPortfolioService(
            sp.GetRequiredService<PortfolioService>(),
            sp.GetRequiredService<IMemoryCache>()));
        services.AddSingleton<IPortfolioService>(sp => sp.GetRequiredService<CachedPortfolioService>());
        services.AddSingleton<IPortfolioCache>(sp => sp.GetRequiredService<CachedPortfolioService>());

        return services;
    }

    /// <summary>Registers one keyed section: its repository and its admin surface.</summary>
    public static IServiceCollection AddPortfolioSection<T>(this IServiceCollection services, string sectionName)
        where T : class, IPortfolioEntry
    {
        services.AddSingleton<IPortfolioSectionRepository<T>>(sp => new FirebaseSectionRepository<T>(
            sectionName,
            sp.GetRequiredService<IFirebaseService>(),
            sp.GetRequiredService<IImageDataSanitizer>()));
        services.AddSingleton<ISectionAdmin, SectionAdminService<T>>();
        return services;
    }

    /// <summary>Registers the admin account options and the credential verifier.</summary>
    public static IServiceCollection AddAdminCredentials(this IServiceCollection services, IConfiguration configuration)
    {
        ArgumentNullException.ThrowIfNull(configuration);

        services.AddOptions<AdminOptions>()
            .Bind(configuration.GetSection(AdminOptions.SectionName))
            .ValidateOnStart();
        services.AddSingleton<IValidateOptions<AdminOptions>, AdminOptionsValidator>();
        services.AddSingleton<IAdminCredentialVerifier, ConfiguredAdminCredentialVerifier>();
        return services;
    }
}
