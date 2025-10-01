---
title: "Use the implicit operator to reduce noise in your code"
slug: use-the-implicit-operator-to-reduce-noise-in-your-code
date: 2024-09-18T10:00:00.000Z
description: "This post demonstrates how to simplify cache key handling in C# by using typed objects and the implicit conversion operator, allowing automatic string conversion without manual method calls."
tags: ["c-sharp","dotnet"]
---

I often use Redis as a distributed cache in my applications. Redis is a key-value store.


I prefer to have my cache keys typed; that is, I don't use plain strings throughout my codebase. Instead, I use objects that are later "translated" into strings.


Here's a basic example:


Suppose we have a cache key that looks like this:


```csharp
public class MyCacheKey
{
    private readonly string _key;
    
    public MyCacheKey()
    {
        _key = $"{Prefix}-{Key}-{Version}";
    }
    
    public required string Prefix { get; init; }
    public required string Key { get; init; }
    public required int Version  {get; init; }

    public string GetKey()
    {
        return _key;
    }
}

```


```csharp
public interface IMyCache
{
    Task<T> Get<T>(MyCacheKey myCacheKey);
}

```


```csharp
public class RedisMyCache : IMyCache
{
    private readonly IDatabase _database;
    
    public RedisMyCache(IDatabase database)
    {
        _database = database;    
    }
    
    public async Task<T> Get<T>(MyCacheKey myCacheKey)
    {
        var value = await db.StringGetAsync(myCacheKey.GetKey());
        // Do something with the string and return it
        ......
    }
}

```


The StringGetAsync method takes a string, so we need to call the GetKey method to retrieve the string representation of MyCacheKey.


But wouldn't it be nice if we could skip that GetKey call?


So instead of writing this:


```csharp
var value = await db.StringGetAsync(myCacheKey.GetKey());

```


We could simply write:


```csharp
var value = await db.StringGetAsync(myCacheKey);

```

<h2 id="implicit-operator">Implicit operator


We can achieve this by using the [**implicit operator**](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/operators/user-defined-conversion-operators?WT.mc_id=DT-MVP-5004074).<br>
Let's update the `MyCacheKey` class:


```csharp
public class MyCacheKey
{
    private readonly string _key;
    
    public MyCacheKey()
    {
        _key = $"{Prefix}-{Key}-{Version}";
    }
    
    public required string Prefix { get; init; }
    public required string Key { get; init; }
    public required int Version  {get; init; }

    public static implicit operator string(MyCacheKey key) => key._key; 
}

```