---
title: "Append correlation id to all log entries in ASP.NET Core"
slug: append-correlation-id-to-all-log-entries-in-asp-net-core
date: 2024-04-26T09:30:00.000Z
description: "The ASP.NET Core logging provider finally has built-in support for enriching logs. I show you how to append a correlation id to all your log entries."
tags: ["asp.net core","logging"]
---

Previously, I used Serilog to append a correlation ID to all my logs, like this:


```csharp
public class LoggingCorrelationIdMiddleware : IMiddleware
{
    private const string CorrelationIdPropertyName = "correlationId";

    private readonly IGetCorrelationIdQuery _getCorrelationIdQuery;

    public LoggingCorrelationIdMiddleware(IGetCorrelationIdQuery getCorrelationIdQuery)
    {
        _getCorrelationIdQuery =
            getCorrelationIdQuery ?? throw new ArgumentNullException(nameof(getCorrelationIdQuery));
    }

    public async Task InvokeAsync(HttpContext context, RequestDelegate next)
    {
        var correlationId = _getCorrelationIdQuery.Execute();
        using(LogContext.PushProperty(CorrelationIdPropertyName, correlationId))
        {
            await next(context);
        }
    }
}

```


This custom middleware utilizes LogContext.PushProperty to add the correlation ID to all log entries. However, LogContext is specific to Serilog.


I've been a heavy Serilog user for as long as I can remember, mainly because Microsoft's own logging package has been subpar.


Anyway, now that I've started a new project, I wanted to see if there's a built-in way to achieve the same thing without Serilog.


And it turns out, there is!


In my freshly created ASP.NET Core application, my Program.cs looks like this (showing only the relevant logging parts):


```csharp
using JOS.Configuration;
using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.DependencyInjection;

var builder = WebApplication.CreateBuilder(args);
builder.Services.AddPocoOptions<LoggingOptions>("Logging", builder.Configuration, out var loggingOptions);
builder.Logging.AddLogging(loggingOptions);
builder.Services.AddScoped<CorrelationIdMiddleware>();
builder.Services.AddAntiforgery();
builder.Services.AddAuthentication();
builder.Services.AddAuthorization();

var app = builder.Build();

app.UseMiddleware<CorrelationIdMiddleware>();
app.UseExceptionHandler();
app.UseStatusCodePages();
app.UseRouting();
app.UseAntiforgery();
app.UseAuthentication();
app.UseAuthorization();
.......

```


`AddLogging` is a custom extension on `ILoggingBuilder` that looks like this:


```csharp
public static ILoggingBuilder AddLogging(this ILoggingBuilder builder, LoggingOptions loggingOptions)
{
    builder = builder.ClearProviders();
    builder.EnableEnrichment();
    builder.Services.AddLogEnricher<CorrelationIdLogEnricher>();
    if(loggingOptions.ShouldLogJson)
    {
        builder.AddJsonConsole(options =>
        {
            options.IncludeScopes = true;
            options.UseUtcTimestamp = true;
            options.JsonWriterOptions = options.JsonWriterOptions with { Indented = false };
        });
    }
    else
    {
        builder.AddSimpleConsole(options =>
        {
            options.SingleLine = true;
            options.ColorBehavior = loggingOptions.LogColor
                ? LoggerColorBehavior.Enabled
                : LoggerColorBehavior.Disabled;
            options.UseUtcTimestamp = true;
        });
    }

    return builder;
}

```


The important bits here is the `builder.EnableEnrichment()` and `builder.Services.AddLogEnricher<CorrelationIdLogEnricher>` calls.


To access these methods, one needs to reference the [Microsoft.Extensions.Telemetry nuget package.](https://www.nuget.org/packages/Microsoft.Extensions.Telemetry?WT.mc_id=DT-MVP-5004074)

<h2 id="activitycorrelationidlogenricher">ActivityCorrelationIdLogEnricher


```csharp
public class ActivityCorrelationIdLogEnricher : ILogEnricher
{
    private readonly IHttpContextAccessor _httpContextAccessor;

    public ActivityCorrelationIdLogEnricher(IHttpContextAccessor httpContextAccessor)
    {
        _httpContextAccessor = httpContextAccessor ?? throw new ArgumentNullException(nameof(httpContextAccessor));
    }

    public void Enrich(IEnrichmentTagCollector collector)
    {
        var httpContext = _httpContextAccessor.HttpContext;
        if(httpContext is not null)
        {
            var httpActivityFeature = httpContext.Features.GetRequiredFeature<IHttpActivityFeature>();
            var activity = httpActivityFeature.Activity;

            var correlationId = activity.GetTagItem("correlationId");
            if(correlationId is not null)
            {
                collector.Add("correlationId", correlationId);
            }
        }
    }
}


```


This enricher, implementing the ILogEnricher interface, extracts the correlation ID from the current Activity, which is populated by the CorrelationIdMiddleware.


Speaking of which, here's the implementation of the CorrelationIdMiddleware:

<h2 id="correlationidmiddleware">CorrelationIdMiddleware


```csharp
public class CorrelationIdMiddleware : IMiddleware
{
    private readonly IProblemDetailsService _problemDetailsService;

    public CorrelationIdMiddleware(IProblemDetailsService problemDetailsService)
    {
        ArgumentNullException.ThrowIfNull(problemDetailsService);
        _problemDetailsService = problemDetailsService;
    }

    public async Task InvokeAsync(HttpContext context, RequestDelegate next)
    {
        if(context.Request.Headers.TryGetValue("X-Correlation-Id", out var values))
        {
            var correlationId = values.First()!;
            if(correlationId.Length > 128)
            {
                var problemDetails = new ValidationErrorProblemDetails
                {
                    Detail = "CorrelationId exceeded max length of 128 chars"
                };
                var problemDetailsContext = new ProblemDetailsContext
                {
                    HttpContext = context, ProblemDetails = problemDetails
                };
                await _problemDetailsService.WriteAsync(problemDetailsContext);
                return;
            }

            context.TraceIdentifier = correlationId;
        }

        var activityFeature = context.Features.GetRequiredFeature<IHttpActivityFeature>();
        var activity = activityFeature.Activity;
        activity.AddTag("correlationId", context.TraceIdentifier);
        await next(context);
    }
}


```


This middleware enables callers to provide their own correlation ID through the X-Correlation-Id header. If a valid header value is supplied, the middleware updates the TraceIdentifier within the current HttpContext and attaches a corresponding tag to the current Activity. This ensures seamless propagation of the correlation ID throughout the logging context.

<h2 id="result">Result

<h3 id="before-enrichment">Before enrichment


As you can see, no correlation id is logged.


```javascript
[
    {
        "EventId": 0,
        "LogLevel": "Information",
        "Category": "Microsoft.AspNetCore.Routing.EndpointMiddleware",
        "Message": "Executing endpoint \u0027HTTP: GET /health =\u003E Handle\u0027",
        "State": {
            "Message": "Executing endpoint \u0027HTTP: GET /health =\u003E Handle\u0027",
            "EndpointName": "HTTP: GET /health =\u003E Handle",
            "{OriginalFormat}": "Executing endpoint \u0027{EndpointName}\u0027"
        }
    },
    {
        "EventId": 1,
        "LogLevel": "Information",
        "Category": "Microsoft.AspNetCore.Routing.EndpointMiddleware",
        "Message": "Executed endpoint \u0027HTTP: GET /health =\u003E Handle\u0027",
        "State": {
            "Message": "Executed endpoint \u0027HTTP: GET /health =\u003E Handle\u0027",
            "EndpointName": "HTTP: GET /health =\u003E Handle",
            "{OriginalFormat}": "Executed endpoint \u0027{EndpointName}\u0027"
        }
    }
]

```

<h3 id="after-enrichment">After enrichment


`correlationId` is added to the `State` object.


```javascript
[
    {
        "EventId": 0,
        "LogLevel": "Information",
        "Category": "Microsoft.AspNetCore.Routing.EndpointMiddleware",
        "Message": "Executing endpoint \u0027HTTP: GET /health =\u003E Handle\u0027",
        "State": {
            "Message": "Executing endpoint \u0027HTTP: GET /health =\u003E Handle\u0027",
            "EndpointName": "HTTP: GET /health =\u003E Handle",
            "{OriginalFormat}": "Executing endpoint \u0027{EndpointName}\u0027",
            "correlationId": "0HN35Q6SQ5PMT:0000000F"
        }
    },
    {
        "EventId": 1,
        "LogLevel": "Information",
        "Category": "Microsoft.AspNetCore.Routing.EndpointMiddleware",
        "Message": "Executed endpoint \u0027HTTP: GET /health =\u003E Handle\u0027",
        "State": {
            "Message": "Executed endpoint \u0027HTTP: GET /health =\u003E Handle\u0027",
            "EndpointName": "HTTP: GET /health =\u003E Handle",
            "{OriginalFormat}": "Executed endpoint \u0027{EndpointName}\u0027",
            "correlationId": "0HN35Q6SQ5PMT:0000000F"
        }
    }
]

```