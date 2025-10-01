---
title: "Don't reinvent the wheel - configuration"
slug: dont-reinvent-the-wheel-configuration-dotnet-core
date: 2025-06-07T09:08:15.000Z
description: "Avoid creating custom environment helpers - use the built-in functionality instead."
tags: ["tips and tricks","dotnet","dotnet core","asp.net core"]
---

More often than not, I find code in various dotnet core solutions that contains code like this:


**Program.cs**


```csharp
.......
if(EnvironmentHelper.IsLocal)
{
    services.AddSingleton<ICustomerClient, MockedCustomerClient>();
}
else
{
    services.AddSingleton<ICustomerClient, CustomerClient>();
}
.......

```


**EnvironmentHelper** looks like this:


```csharp
public static class EnvironmentHelper
{

    public static bool IsLocal
    {
        get
        {
            var config = new ConfigurationBuilder()
                .AddJsonFile("appsettings.json", optional: false)
                .Build();
            return config.GetValue<bool>("IsDevelopmentEnvironment");
        }
    }   

```


Now, there's a couple of issues with this.<br>
First of all, the code in `EnvironmentHelper` has some room for improvement. Everytime `EnvironmentHelper.IsLocal` is accessed, it will create a new instance of `ConfigurationBuilder` and read the `appsettings.json` from disk. The code is used all over the code base as well, in really hot code paths. Not good.


Let's see how we can avoid this and use the built-in tools of the framework instead of coming up with our own solutions.


*Note: I'm not too fond of registering different implementations depending on which environment your code is executing in, but that's another story.*

<h2 id="ihostenvironment">IHostEnvironment


When registering services, you can use the overload that gives you access to the service provider, like this:


```csharp
builder.Services.AddSingleton<ICustomerClient>(provider =>
{
    var environment = provider.GetRequiredService<IHostEnvironment>();
    if(environment.IsDevelopment())
    {
        return provider.GetRequiredService<MockedCustomerClient>();
    }

    return provider.GetRequiredService<CustomerClient>();
});

```


Here I'm retrieving the `IHostEnvironment` from the service provider.<br>
But this requires us to register both the `MockedCustomerClient` and `CustomerClient` since we're using the container to resolve the instances.


A better approach is to use the builder. The builder contains a property, `Environment`, and you can use it like this:


```csharp
var builder = WebApplication.CreateBuilder(args);
if(builder.Environment.IsDevelopment())
{
    builder.Services.AddSingleton<ICustomerClient, MyMockClient>();
}
else
{
    builder.Services.AddSingleton<ICustomerClient, MyProductionClient>();
}

```


By default, the framework will set the environment based on the value of the `ASPNETCORE_ENVIRONMENT`/`DOTNET_ENVIRONMENT` environment variable, so, there's no need to involve `appsettings.json` at all.


So, the key take-away from this post is: Don't reinvent the wheel; more often than not, the framework already supports your use case, if it doesn't, it's usually for a good reason.

<h2 id="bonus">Bonus


It was not possible for me to remove the usage of the above mentioned `EnvironmentHelper` in the project I'm currently working in. It's used in a bunch of different places and I could not get approval of doing said refactoring. But I couldn't leave it as-is since then I would not be able to sleep at night, knowing that for every request to our site, we're new-ing up a `ConfigurationBuilder` ~ 10 times...


So, I did a quick and dirty "fix", behold:


```csharp
public static class EnvironmentHelper
{
    private static readonly Lazy<bool> IsLocalInternal;

    static EnvironmentHelper()
    {
        IsLocalInternal = new Lazy<bool>(() =>
        {   var config = new ConfigurationBuilder()
                .AddJsonFile("appsettings.json", optional: false)
                .Build();
            return config.GetValue<bool>("IsDevelopmentEnvironment");
        }, LazyThreadSafetyMode.ExecutionAndPublication);
    }

    public static bool IsLocal => IsLocalInternal.Value;
}

```