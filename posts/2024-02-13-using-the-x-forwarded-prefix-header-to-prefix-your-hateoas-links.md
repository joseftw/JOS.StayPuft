---
title: "Using the X-Forwarded-Prefix header to prefix your HATEOAS links in your API"
slug: using-the-x-forwarded-prefix-header-to-prefix-your-hateoas-links
date: 2024-02-13T11:42:35.000Z
description: "Use the X-Forwarded-Host and X-Forwarded-Prefix to manipulate your HATEOAS links in your API responses."
tags: ["asp.net core"]
---

<blockquote>

2025-07-03 Breaking change in Forwarded headers middleware.<br>
Microsoft released a breaking change regarding this middleware: [https://github.com/aspnet/Announcements/issues/517](https://github.com/aspnet/Announcements/issues/517)<br>
You now need to configure a trusted proxy, otherwise the headers will be ignored. It's possible to restore the previous behaviour, more info in the link.

</blockquote>
<h2 id="scenario">Scenario


All our requests towards our API goes [through a BFF](https://learn.microsoft.com/en-us/azure/architecture/patterns/backends-for-frontends?WT.mc_id=DT-MVP-5004074) (think of it as a proxy).<br>
The client calls our BFF and the BFF proxies that call to our API.<br>
Now, our API knows nothing about the BFF, it just receives a request and handles it accordingly.


To call our API, we simply call the BFF and prefix the path like this:


`https://my-bff.local/my-api/orders/{orderId}`

<h2 id="the-problem">The problem


Our API is a [HATEOAS API](https://learn.microsoft.com/en-us/azure/architecture/best-practices/api-design?WT.mc_id=DT-MVP-5004074#use-hateoas-to-enable-navigation-to-related-resources) so it contains a bunch of links to different resources in its response, allowing the consumer to navigate appropriately without needing to hardcode any URLs.


Here's an example response:


```
{
  "orderID":3,
  "productID":2,
  "quantity":4,
  "orderValue":16.60,
  "links":[
    {
      "rel":"customer",
      "href":"https://my-api.local/customers/3",
      "action":"GET",
      "types":["text/xml","application/json"]
    },
    {
      "rel":"customer",
      "href":"https://my-api.local/customers/3",
      "action":"PUT",
      "types":["application/x-www-form-urlencoded"]
    },
    {
      "rel":"customer",
      "href":"https://my-api.local/customers/3",
      "action":"DELETE",
      "types":[]
    },
    {
      "rel":"self",
      "href":"https://my-api.local/orders/3",
      "action":"GET",
      "types":["text/xml","application/json"]
    },
    {
      "rel":"self",
      "href":"https://my-api.local/orders/3",
      "action":"PUT",
      "types":["application/x-www-form-urlencoded"]
    },
    {
      "rel":"self",
      "href":"https://my-api.local/orders/3",
      "action":"DELETE",
      "types":[]
    }]
}

```


As you can see, the API returns *absolute* URLs pointing directly to the *API*.


That's a bit problematic.


Remember that we said that we didn't want the client to do any hardcoding or manipulation of the links? All the calls should go through the BFF. So, wouldn't it be nice if the links returned from the API pointed to the BFF instead of the API?

<h2 id="the-solution">The solution


The link generation in the API is done like this:


```csharp
public class HateoasLinkGenerator : ILinkGenerator
{
    private readonly LinkGenerator _linkGenerator;
    private readonly IHttpContextAccessor _httpContextAccessor;

    public AspNetLinkGenerator(LinkGenerator linkGenerator, IHttpContextAccessor httpContextAccessor)
    {
        _linkGenerator = linkGenerator;
        _httpContextAccessor = httpContextAccessor;
    }

    public string GetUriByAction(string action, string controller, object? values = null)
    {
        var httpContext = _httpContextAccessor.HttpContext!;
        var result = _linkGenerator.GetUriByAction(
                httpContext!, action, controller, values) ??
            throw new Exception(
                $"Failed to generate link: '{action}' and controller '{controller}' returned null");
        return result;
    }
}

```


We don't want the API to know anything about the BFF, so we can't just replace the host and prefix the path and be done with it. Instead, we will use a couple of `X-Forwarded` headers.


The built-in [LinkGenerator](https://learn.microsoft.com/en-us/dotnet/api/microsoft.aspnetcore.routing.linkgenerator?view=aspnetcore-8.0?WT.mc_id=DT-MVP-5004074) respects the usage of those headers.

<h3 id="x-forwarded-host">X-Forwarded-Host


To return the correct host, we will send the `X-Forwarded-Host` header with the value of the BFF:


```
X-Forwarded-Host: my-bff.local

```


If we generate the response now, it will look like this:


```
{
  "orderID":3,
  "productID":2,
  "quantity":4,
  "orderValue":16.60,
  "links":[
    {
      "rel":"customer",
      "href":"https://my-bff.local/customers/3",
      "action":"GET",
      "types":["text/xml","application/json"]
    },
    {
      "rel":"customer",
      "href":"https://my-bff.local/customers/3",
      "action":"PUT",
      "types":["application/x-www-form-urlencoded"]
    },
    {
      "rel":"customer",
      "href":"https://my-bff.local/customers/3",
      "action":"DELETE",
      "types":[]
    },
    {
      "rel":"self",
      "href":"https://my-bff.local/orders/3",
      "action":"GET",
      "types":["text/xml","application/json"]
    },
    {
      "rel":"self",
      "href":"https://my-bff.local/orders/3",
      "action":"PUT",
      "types":["application/x-www-form-urlencoded"]
    },
    {
      "rel":"self",
      "href":"https://my-bff.local/orders/3",
      "action":"DELETE",
      "types":[]
    }]
}

```


As you can see, the links now point to the BFF, but they're still missing the `my-api` prefix.

<h3 id="x-forwaded-prefix">X-Forwaded-Prefix


To append the `my-api` prefix to all the paths, we'll send the `X-Forwarded-Prefix` header from the BFF to the API like this:


```
X-Forwarded-Prefix: /my-api

```


Now, the response will look like this:


```
{
  "orderID":3,
  "productID":2,
  "quantity":4,
  "orderValue":16.60,
  "links":[
    {
      "rel":"customer",
      "href":"https://my-bff.local/my-api/customers/3",
      "action":"GET",
      "types":["text/xml","application/json"]
    },
    {
      "rel":"customer",
      "href":"https://my-bff.local/my-api/customers/3",
      "action":"PUT",
      "types":["application/x-www-form-urlencoded"]
    },
    {
      "rel":"customer",
      "href":"https://my-bff.local/my-api/customers/3",
      "action":"DELETE",
      "types":[]
    },
    {
      "rel":"self",
      "href":"https://my-bff.local/my-api/orders/3",
      "action":"GET",
      "types":["text/xml","application/json"]
    },
    {
      "rel":"self",
      "href":"https://my-bff.local/my-api/orders/3",
      "action":"PUT",
      "types":["application/x-www-form-urlencoded"]
    },
    {
      "rel":"self",
      "href":"https://my-bff.local/my-api/orders/3",
      "action":"DELETE",
      "types":[]
    }]
}

```


Mission accomplished!


[Don't forget to enable the forwarded headers middleware in your API if you're using ASP.NET Core.](https://learn.microsoft.com/en-us/aspnet/core/host-and-deploy/proxy-load-balancer?view=aspnetcore-8.0#forwarded-headers-middleware-options&WT.mc_id=DT-MVP-5004074)