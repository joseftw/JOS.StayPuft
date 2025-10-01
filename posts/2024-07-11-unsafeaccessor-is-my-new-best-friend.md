---
title: "UnsafeAccessor is my new best friend"
slug: unsafeaccessor-is-my-new-best-friend
date: 2024-07-11T10:23:56.000Z
description: "How can you access a private field using both Reflection and the new UnsafeAccessor approach introduced in .NET 8, and what are the benefits in terms of performance and code reduction?"
tags: ["dotnet","dotnet core"]
---

<h2 id="the-problem">The problem


For reasons I don't want to disclose, I **really** needed to access a private field in the `RedisCache` class in the [Microsoft.Extensions.Caching.StackExchangeRedis](https://www.nuget.org/packages/Microsoft.Extensions.Caching.StackExchangeRedis) package, namely the `_cache` field.


```csharp
public class RedisCache : IDistributedCache, IDisposable
{
    ...
    private volatile IDatabase _cache;
    ...
}

```


The `_cache` field is initialized by calling `Connect`. That method is also **private**.


```csharp
// https://github.com/dotnet/aspnetcore/blob/main/src/Caching/StackExchangeRedis/src/RedisCache.cs
private IDatabase Connect()
{
    CheckDisposed();
    var cache = _cache;
    if (cache is not null)
    {
        Debug.Assert(_cache is not null);
        return cache;
    }

    _connectionLock.Wait();
    try
    {
        cache = _cache;
        if (cache is null)
        {
            IConnectionMultiplexer connection;
            if (_options.ConnectionMultiplexerFactory is null)
            {
                connection = ConnectionMultiplexer.Connect(_options.GetConfiguredOptions());
            }
            else
            {
                connection = _options.ConnectionMultiplexerFactory().GetAwaiter().GetResult();
            }

            PrepareConnection(connection);
            cache = _cache = connection.GetDatabase();
        }
        Debug.Assert(_cache is not null);
        return cache;
    }
    finally
    {
        _connectionLock.Release();
    }
}

```


The `Connect` method returns the `IDatabase` instance that we're interested in, so the only thing we need to do is to call the `Connect` method.


How can we do that when the method is **private**?

<h3 id="old-solutionreflection">Old solution - Reflection


Here's an extension method for `RedisCache`. Reflection is used to retrieve and invoke the **private** method.


```csharp
public static IDatabase GetDatabase(this RedisCache redisCache)
{
    const BindingFlags flags = BindingFlags.Instance | BindingFlags.NonPublic;
    var connectMethod = redisCache.GetType().GetMethod("Connect", flags);
    if(connectMethod is null)
    {
        throw new Exception("Connect method was not found");
    }
    var result = connectMethod.Invoke(redisCache, null);
    if(result is IDatabase database)
    {
        return database;
    }

    throw new Exception("Failed to extract IDatabase");
}

```

<h3 id="new-solutionunsafeaccessor">New solution - UnsafeAccessor


Here we're using [UnsafeAccessor](https://learn.microsoft.com/en-us/dotnet/api/system.runtime.compilerservices.unsafeaccessorattribute?view=net-8.0&WT.mc_id=DT-MVP-5004074) that was introduced in .NET 8.


```csharp
public static class RedisCacheAccessor
{
    public static IDatabase GetDatabase(this RedisCache redisCache)
    {
        return Database(redisCache) ?? throw new Exception("Failed to extract IDatabase");
    }

    [UnsafeAccessor(UnsafeAccessorKind.Method, Name = "Connect")]
    private static extern IDatabase Connect(this RedisCache redisCache);
}

```


As you can see, it's a lot less code. In fact, if we don't want to use our own exception, we can shorten the code even more:


```csharp
public static class RedisCacheAccessor
{
    [UnsafeAccessor(UnsafeAccessorKind.Method, Name = "Connect")]
    public static extern IDatabase Connect(RedisCache redisCache);
}

```

<h3 id="benchmark">Benchmark


Using the `UnsafeAccessor` approach not only results in less code but also performs **significantly** faster.


```
BenchmarkDotNet v0.13.12, macOS 15.0 (24A5289g) [Darwin 24.0.0]
Apple M2, 1 CPU, 8 logical and 8 physical cores
.NET SDK 9.0.100-preview.6.24328.19
  [Host]     : .NET 9.0.0 (9.0.24.32707), Arm64 RyuJIT AdvSIMD
  DefaultJob : .NET 9.0.0 (9.0.24.32707), Arm64 RyuJIT AdvSIMD


| Method         | Mean       | Error     | StdDev    | Median     | Ratio | Allocated | Alloc Ratio |
|--------------- |-----------:|----------:|----------:|-----------:|------:|----------:|------------:|
| Reflection     | 19.4048 ns | 0.3879 ns | 0.7285 ns | 19.0639 ns |  1.00 |         - |          NA |
| UnsafeAccessor |  0.3473 ns | 0.0392 ns | 0.0452 ns |  0.3341 ns |  0.02 |         - |          NA |


```


Benchmark code:


```csharp
[MemoryDiagnoser]
public class GetDatabaseBenchmark
{
    private static RedisCache RedisCache;

    [GlobalSetup]
    public static void Setup()
    {
        var configurationOptions = new ConfigurationOptions
        {
            EndPoints = new EndPointCollection(new List<EndPoint>{ new DnsEndPoint("localhost", 6379)}),
            Password = "my-password"
        };
        var options = new RedisCacheOptions
        {
            ConfigurationOptions = configurationOptions
        };
        RedisCache = new RedisCache(options);
        _ = RedisCache.GetString("test"); // Warm it up
    }

    [Benchmark(Baseline = true)]
    public IDatabase Reflection() => RedisCache.GetDatabaseReflection();

    [Benchmark]
    public IDatabase UnsafeAccessor() => RedisCache.GetDatabaseUnsafe();
}

public static class RedisCacheAccessor
{
    [UnsafeAccessor(UnsafeAccessorKind.Method, Name = "Connect")]
    public static extern IDatabase Connect(RedisCache redisCache);
}

```