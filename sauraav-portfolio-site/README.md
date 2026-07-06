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
dotnet run -- hash-password "<strong-password>"   # prints a PBKDF2 hash
dotnet user-secrets set "Admin:PasswordHash" "<printed-hash>"
```

`Admin:Password` (plaintext) is still accepted as a fallback but logs a warning at
startup; prefer `Admin:PasswordHash`.

### Production

Set the same keys as environment variables (prefixed with `Firebase__` / `Admin__` per .NET convention) or via your hosting provider's secret store.

### Security

- Admin password verified with PBKDF2-SHA256 (600k iterations) in constant time
- Login endpoint rate-limited to 5 attempts per minute per IP
- Auth cookie: `HttpOnly`, `Secure`, `SameSite=Strict`, 8h sliding expiration
- All mutating admin endpoints require an antiforgery token (incl. deletes)
- Video uploads restricted to `.mp4`/`.webm`/`.gif`, 100 MB cap, stored under a random name
- Content-Security-Policy, `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, and `Permissions-Policy` headers on every response

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
