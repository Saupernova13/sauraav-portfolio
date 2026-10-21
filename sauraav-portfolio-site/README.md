# Sauraav Jayrajh — Portfolio Site

An ASP.NET Core 8 MVC portfolio site. Content is edited through a small admin panel and stored in
Firebase Realtime Database; the public page is server-rendered and tuned for phones and low-end
devices.

## Prerequisites

- [.NET 8 SDK](https://dotnet.microsoft.com/download/dotnet/8)
- A Firebase Realtime Database (optional for local development, see below)

## Configuration

Secrets never go in the repository. Locally they live in user secrets; in production they are
environment variables (`Admin__PasswordHash`, `Firebase__DatabaseUrl`, ...).

| Key | Required | Purpose |
|-----|----------|---------|
| `Admin:Username` | yes | Admin login name. |
| `Admin:PasswordHash` | yes* | PBKDF2 hash of the admin password (see below). |
| `Admin:Password` | no | Plaintext fallback for migration only. A warning is logged while it is in use. |
| `Firebase:DatabaseUrl` | no | Realtime Database URL. When empty the app uses an in-memory store that resets on restart. |
| `Firebase:ServiceAccountJsonPath` | no | Path to a service-account JSON file. When set, database calls are authenticated so the rules can deny anonymous writes. |

\* one of `PasswordHash` or `Password` must be set.

### Generate the password hash

The password is read from standard input so it never lands in shell history:

```bash
echo "<strong-password>" | dotnet run --project sauraav-portfolio-site -- hash-password
```

### Local development

```bash
cd sauraav-portfolio-site
dotnet user-secrets set "Admin:Username" "admin"
dotnet user-secrets set "Admin:PasswordHash" "<output of hash-password>"
# optional: point at a real database
dotnet user-secrets set "Firebase:DatabaseUrl" "https://<your-project>.firebasedatabase.app/"
dotnet user-secrets set "Firebase:ServiceAccountJsonPath" "C:/secure/path/service-account.json"
```

Without `Firebase:DatabaseUrl` the site runs entirely in memory, which is enough to try the admin
panel and the public page.

### Firebase rules

Once `ServiceAccountJsonPath` is configured, lock the database down so only the server can write:

```json
{
  "rules": {
    ".read": true,
    ".write": "auth != null"
  }
}
```

## Running locally

```bash
dotnet run --project sauraav-portfolio-site
```

Then open `https://localhost:7120`. The admin panel is at `/Admin`.

## Building and testing

```bash
dotnet build
dotnet test
```

`nuget.config` pins restores to nuget.org so builds behave the same on CI and on machines with
private feeds configured.

## Project structure

```
sauraav-portfolio-site/
  Controllers/        Home (public page), Account (login), Admin (JSON API + panel), Media (images)
  Filters/            ApiExceptionFilter: generic 500s for the admin API
  Middleware/         SecurityHeadersMiddleware: CSP and hardening headers
  Models/             Entry models, options, validation attributes
  Services/
    Auth/             IAdminCredentialVerifier (PBKDF2 hash, constant-time compare)
    Firebase/         IFirebaseService: Realtime Database transport + in-memory stand-in
    Images/           Base64 sanitising and content-type sniffing
    Media/            IMediaStorage: validated video uploads under wwwroot/videos
    Portfolio/        IPortfolioService (read model) + cached decorator with invalidation
    Sections/         Generic per-section repositories and the admin surface (ISectionAdmin)
  Tools/              hash-password command
  Views/              Razor views (public page has its own head; admin uses _Layout)
  wwwroot/
    css/portfolio.css Public stylesheet (single file)
    css/admin.css     Admin theme over Bootstrap 5.1
    js/portfolio/     starfield.js, effects.js, sections.js
    js/admin/         admin.js, login.js
tests/sauraav-portfolio-site.Tests/   xUnit tests
docs/                 Review notes
```

### Adding a portfolio section

1. Add a model that implements `IPortfolioEntry` (and `IHasImage` if it carries a picture).
2. Register it once in `ServiceCollectionExtensions.AddPortfolio`:
   `services.AddPortfolioSection<MyModel>("my-section");`
3. Add the form and table markup to `Views/Admin/Index.cshtml` and one entry to `SECTIONS` in
   `wwwroot/js/admin/admin.js`.
4. Render it in `Views/Home/Index.cshtml` via `PortfolioViewModel`.

The admin API (`/Admin/Sections/{section}`), validation, key handling, cache invalidation and
image sanitising all come for free.

## Admin panel

- Cookie authentication with a hardened cookie, a per-IP rate limit on the login form, and session
  invalidation when the password hash changes.
- Every request carries an antiforgery token; all input is validated server-side.
- Videos are checked by signature (MP4/WebM), renamed to a GUID and capped at 100 MB.
- Images are resized in the browser before upload and capped at roughly 2 MB server-side.
