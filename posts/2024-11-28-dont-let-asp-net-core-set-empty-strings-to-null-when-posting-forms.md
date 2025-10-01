---
title: "Don't let ASP.NET Core set empty strings to null when posting forms"
slug: dont-let-asp-net-core-set-empty-strings-to-null-when-posting-forms
date: 2024-11-28T21:50:48.000Z
description: "This post highlights how ASP.NET Core converts empty strings to null in form submissions and demonstrates how to prevent this behavior."
tags: ["asp.net core","c-sharp"]
---

Recently, I&#x2019;ve been involved in a project where an old ASP.NET Framework solution has been migrated to ASP.NET Core 8.


Today, a bug report was filed: a form that was posted to one of the endpoints could no longer be saved, and a 500 Internal Server Error was returned.


The error occurred due to a `NullReferenceException`. The action method looked something like this:


```csharp
[HttpPost("/")]
public ActionResult Index( [FromForm] MyForm myForm)
{
    If(myForm.Input1.Length > 0)
    {
        // Do some work...
    }
    
    return Ok();
}

```


```csharp
public class MyForm
{
    public string Input1 { get; init; }
}

```


Nothing weird, right? (Ignore the non-existing error handling, it's just for the post).


The code that posted the form looked like this:


```javascript
const formData = new URLSearchParams();
formData.append('Input1', '');
fetch('/', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded',
  },
  body: formData.toString()
})
  .then(response => response.json())
  .then(data => {
    console.log('Success:', data);
  })
  .catch((error) => {
    console.error('Error:', error);
  });

```


The important thing here is that Input1 is set to an empty string `''`.


Given the above, what would you expect to happen when posting this form to the ASP.NET Core action method?

<ol>
<li>ASP.NET Core will set Input1 to an empty string &#x2013; since that&#x2019;s what was posted.</li>
<li>ASP.NET Core will set Input1 to `null`.</li>
</ol>

There&#x2019;s only one way to find out. I've updated my endpoint to simply return whatever gets posted to it:


```csharp
public class MyController : ControllerBase
{
    [HttpPost("/")]
    public ActionResult Index([FromForm] MyForm myForm)
    {
        return Ok(myForm);
    }
}

```


```csharp
public class MyUnitTest : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly WebApplicationFactory<Program> _factory;

    public MyUnitTest(WebApplicationFactory<Program> factory)
    {
        _factory = factory ?? throw new ArgumentNullException(nameof(factory));
    }

    [Fact]
    public async Task ShouldNotSetStringToNullWhenPassingInEmptyString()
    {
        var client = _factory.CreateClient();
        var content = new FormUrlEncodedContent(new List<KeyValuePair<string, string>>
        {
            new("Input1", string.Empty)
        });
        var request = new HttpRequestMessage(HttpMethod.Post, "/")
        {
            Content = content
        };

        var response = await client.SendAsync(request);

        var responseBody = await response.Content.ReadAsStreamAsync();
        var responseJson = await JsonDocument.ParseAsync(responseBody);
        var input1Value = responseJson.RootElement.GetProperty("input1").GetString();
        input1Value.ShouldBe(string.Empty);
    }
}

```


As one might expect, this test... **F A I L S.**


When posting an empty string, ASP.NET Core **does not** set the corresponding property to an empty string. Instead, it sets it to `null`.


<img src="https://josef.codes/content/images/2023/01/nuke-explosion.gif" alt="Nuke Explosion" loading="lazy">

<h2 id="the-fix">The fix


You can fix this in a couple of different ways.

<h3 id="endpoint-specific">Endpoint specific


Decorate your property with the `DisplayFormat` attribute.


```csharp
public class MyForm
{

    [DisplayFormat(ConvertEmptyStringToNull = false)]
    public string Input1 { get; init; }
}

```

<h3 id="globally">Globally


Create a custom `IDisplayMetadataProvider` that sets `ConvertEmptyStringToNull` to `false` for all `string` properties.<br>
Minimal poc


```csharp
using Microsoft.AspNetCore.Mvc;
using WebApplication1;

var builder = WebApplication.CreateBuilder(args);
builder.Services.AddControllers();
builder.Services.Configure<MvcOptions>(options =>
{
    options.ModelMetadataDetailsProviders.Add(new EmptyStringEnabledDisplayMetadataProvider());
});

var app = builder.Build();
app.MapControllers();
app.Run();

```


```csharp
public class EmptyStringEnabledDisplayMetadataProvider : IDisplayMetadataProvider
{
    public void CreateDisplayMetadata(DisplayMetadataProviderContext context)
    {
        if (context.Key.ModelType == typeof(string))
        {
            context.DisplayMetadata.ConvertEmptyStringToNull = false;
        }
    }
}

```


More info regarding this can be found in [this GitHub issue](https://github.com/dotnet/aspnetcore/issues/29948?WT.mc_id=DT-MVP-5004074)