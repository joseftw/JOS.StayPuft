---
title: "JOS.Enumeration - Minimal API support"
slug: jos-enumeration-minimal-api-support
date: 2025-07-19T12:10:47.000Z
description: "Binding enumerations in ASP.NET Core Minimal APIs using TryParse and BindAsync methods for parameter binding."
tags: ["asp.net core","jos.enumeration","minimal api"]
---

I have the following enumeration: `ResponseType`


```csharp
public partial class ResponseType : IEnumeration<string, ResponseType>
{
    public static readonly ResponseType Code = new("code", "Code");
    public static readonly ResponseType IdToken = new("id_token", "Id Token");
    public static readonly ResponseType Token = new("token", "Token");
}

```


I then have the following endpoint in my API: `/authorize`


```csharp
public static class AuthorizationEndpoint
{
    public static async Task Handle(
        [FromServices] AuthorizationHandler handler,
        [AsParameters] AuthenticationRequest request)
    {
        var query = new AuthorizationQuery
        {
            ......
            ClientId = request.ClientId,
            ResponseType = request.ResponseType,
            ......
        }
        var result = await handler.Handle(query);
        ......
    }
}

```


`AuthenticationRequest` looks like this:


```csharp
public class AuthenticationRequest_GET
{
    [FromQuery(Name = "client_id")]
    public required string ClientId { get; init; }
    [FromQuery(Name = "response_type")]
    public required ResponseType ResponseType { get; init; }
}

```


As you can see, I want to bind the query variable `response_type` directly to my enumeration `ResponseType`.


Usually, in a regular plain old MVC solution, I would create a custom model binder and move on with my life.


But since this is a [Minimal API project](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/minimal-apis/parameter-binding?WT.mc_id=DT-MVP-5004074), we'll need to handle this a bit different, with minimal support...&#x1F941;

<h2 id="out-of-the-box">Out of the Box


If you don't do anything, you will receive the following error:

<blockquote>

System.InvalidOperationException<br>
ResponseType must have a valid TryParse method to support converting from a string. No public static bool ResponseType.TryParse(string, out ResponseType) method found for ResponseType.

</blockquote>

It turns out there are two ways of handling this in Minimal APIs.

<h3 id="tryparse">[TryParse](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/minimal-apis/parameter-binding?view=aspnetcore-10.0&WT.mc_id=DT-MVP-5004074#tryparse)


If you want to use a value that comes from the `path`, `querystring` or `header`, you can implement `TryParse`. This is the method I added support for in [JOS.Enumeration](https://github.com/joseftw/jos.enumeration) version `4.1.26-beta-ge9be576cbe`.


In my case, the library will auto generate the following methods:


```csharp
public static bool TryParse(string value, IFormatProvider formatProvider, out ResponseType? result)
{
    return FromValue(value, out result);
}

public static bool TryParse(string value, out ResponseType? result)
{
    return FromValue(value, out result);
}

```


Since the library already had similar support by using the `FromValue` method, it was rather straight forward to implement this.<br>
However, if you're not using a `string` key, it was slightly more complex.<br>
Here's an example of what will be generated when using an `int`:


```csharp
public static bool TryParse(string value, IFormatProvider formatProvider, out IntEnumeration? result)
{
    try
    {
        var convertedValue = (int)Convert.ChangeType(value, typeof(int), formatProvider);
        return FromValue(convertedValue, out result);
    }
    catch
    {
        result = null;
        return false;
    }
}

public static bool TryParse(string value, out IntEnumeration? result)
{
    try
    {
        var convertedValue = (int)Convert.ChangeType(value, typeof(int), null);
        return FromValue(convertedValue, out result);
    }
    catch
    {
        result = null;
        return false;
    }
}

```


By simply updating the package, parameter binding now works out of the box for my use case (querystring).<br>
<img src="https://josef.codes/content/images/2025/07/parameter-binding-works.png" alt="parameter-binding-works.png" loading="lazy">

<h3 id="bindasync">[BindAsync](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/minimal-apis/parameter-binding?view=aspnetcore-10.0&WT.mc_id=DT-MVP-5004074#bindasync)


If you want to have more control over the binding, you can implement the `BindAsync` method. This gives you access to the `HttpContext` and you have full control.


However, this can be a bit overkill. Imagine I want to read the `response_type` value from the body instead of the querystring. When implementing the `BindAsync` method, I'm forced to handle all properties, not just the one I'm interested in.


Luckily, there's another way. When reading from the body, you can specify a `JsonConverter` on the property like this:


```csharp
public class AuthenticationRequest
{
    [JsonPropertyName("client_id")]
    public required string ClientId { get; init; }
    
    [JsonPropertyName("response_type")]
    [JsonConverter(typeof(EnumerationJsonConverter<string, ResponseType>))]
    public required ResponseType ResponseType { get; init; }

```


That will bind the `ResponseType` correctly. The `EnumerationJsonConverter` is already available in the `JOS.Enumeration` package.