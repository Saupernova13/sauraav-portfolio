using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;

namespace sauraav_portfolio_site.Filters;

public sealed class ApiExceptionFilter : IExceptionFilter
{
    private static readonly Action<ILogger, string?, Exception?> LogUnhandled =
        LoggerMessage.Define<string?>(LogLevel.Error, new EventId(1, "UnhandledException"), "Unhandled exception in {Action}");

    private readonly ILogger<ApiExceptionFilter> _logger;

    public ApiExceptionFilter(ILogger<ApiExceptionFilter> logger) => _logger = logger;

    public void OnException(ExceptionContext context)
    {
        LogUnhandled(_logger, context.ActionDescriptor.DisplayName, context.Exception);

        context.Result = new JsonResult(new { success = false, message = context.Exception.Message })
        {
            StatusCode = StatusCodes.Status500InternalServerError,
        };
        context.ExceptionHandled = true;
    }
}
