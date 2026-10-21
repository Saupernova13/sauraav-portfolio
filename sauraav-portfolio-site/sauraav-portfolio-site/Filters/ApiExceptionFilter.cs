using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using sauraav_portfolio_site.Controllers;

namespace sauraav_portfolio_site.Filters;

/// <summary>Turns unhandled exceptions in JSON endpoints into a generic 500 without leaking details.</summary>
public sealed class ApiExceptionFilter : IExceptionFilter
{
    private static readonly Action<ILogger, string?, string, Exception?> LogUnhandled = LoggerMessage.Define<string?, string>(
        LogLevel.Error,
        new EventId(1, "UnhandledException"),
        "Unhandled exception in {Action} (trace {TraceId})");

    private readonly ILogger<ApiExceptionFilter> _logger;

    public ApiExceptionFilter(ILogger<ApiExceptionFilter> logger) => _logger = logger;

    public void OnException(ExceptionContext context)
    {
        ArgumentNullException.ThrowIfNull(context);

        var traceId = context.HttpContext.TraceIdentifier;
        LogUnhandled(_logger, context.ActionDescriptor.DisplayName, traceId, context.Exception);

        context.Result = new JsonResult(ApiResponse.Fail("Something went wrong. Check the server log for trace " + traceId + "."))
        {
            StatusCode = StatusCodes.Status500InternalServerError,
        };
        context.ExceptionHandled = true;
    }
}
