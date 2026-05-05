# Sauraav Jayrajh — Portfolio Site

An ASP.NET Core 8 MVC portfolio site backed by Firebase Realtime Database.

## Prerequisites

- [.NET 8 SDK](https://dotnet.microsoft.com/download/dotnet/8)
- Firebase Realtime Database project

## Configuration

The app requires a Firebase database URL and admin credentials. Never commit secrets to the repository.

### Local development

```bash
cd sauraav-portfolio-site
dotnet user-secrets init
dotnet user-secrets set "Firebase:DatabaseUrl" "https://<your-project>.firebasedatabase.app/"
dotnet user-secrets set "Admin:Username" "admin"
dotnet user-secrets set "Admin:Password" "<strong-password>"
```

### Production

Set the same keys as environment variables (prefixed with `Firebase__` / `Admin__` per .NET convention) or via your hosting provider's secret store.

## Running locally

```bash
dotnet run --project sauraav-portfolio-site
```

Navigate to `https://localhost:5001`.

## Admin panel

`/Admin` is protected by cookie authentication. Log in with the credentials configured above.

## Building

```bash
dotnet build
```

## Testing

```bash
dotnet test
```

## Project structure

```
Controllers/      MVC controllers (Home, Admin, Account)
Filters/          Global action filters (ApiExceptionFilter)
Helpers/          View helpers and utilities
Models/           View models and data models
Services/         Firebase abstraction (IFirebaseService, IPortfolioService)
Views/            Razor views and partials
wwwroot/          Static assets (JS, CSS)
```
