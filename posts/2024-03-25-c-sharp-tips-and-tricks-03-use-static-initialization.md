---
title: "C# - Tips and Tricks 03 - Use static initialization"
slug: c-sharp-tips-and-tricks-03-use-static-initialization
date: 2024-03-25T14:31:00.000Z
description: "Static initialization can help make your code a bit more readable and at the same time give you a performance boost, a win-win."
tags: ["dotnet","dotnet core"]
---

<h2 id="the-problem">The problem


I often see code like this:


```csharp
public class MyClass
{
    public IReadOnlyCollection<string> MyStrings { get: }
    
    public MyClass()
    {
        MyStrings = new List<string>
        {
            "First",
            "Second",
            "Third"
        };
    }
}

```


A collection is exposed via the `MyStrings` property as an `IReadOnlyCollection`. The collection is populated in the constructor with predefined (hardcoded) values.


Do you see any problems with this approach?

<h2 id="the-solution">The solution


The main problem with the above code is that the `MyStrings` collection will be populated everytime an instance of `MyClass` is created. Imagine that you're creating an instance of `MyClass` in some ASP.NET Controller for example. That means that for every request towards your controller, a new list will be created.


Now, in this example this isn't the end of the world, but it's still unneccessary.


One could argue that this is "micro-optimization" that has no real world benefits and yes, I agree.


However, all little things adds up and the "fix" for this scenario is really simple.


Since the collection is initalized in the constructor and then remains static...let's actually make it static.


```csharp
public class MyClass
{
    private static readonly IReadOnlyCollection<string> _myStrings;
    public IReadOnlyCollection<string> MyStrings => _myStrings;
    
    static MyClass()
    {
        _myStrings = new List<string>
        {
            "First",
            "Second",
            "Third"
        };
    }
}

```


Too me, this code is "better" in two ways.

<ol>
<li>The intent of the code is a bit more clear, by making it `static`, when *I* read the code *I* immediately think of it as a "global" collection that will only be initialized *once*.</li>
<li>Since it only will be initalized once, we get the added benefit of a performance "boost" for free. As I said earlier, the main reason for using the static initialization in this case is NOT because we care about the performance. It's to show intent.</li>
</ol>
<blockquote>

The fastest code is the code which does not run

</blockquote>

If we can make our code only run once and get the same functionality (*and faster performance*) with minimal changes to our code, I think it's a no-brainer. This is not micro-optimization, this is just code that's a bit more readable and also just happens to run faster, that's a win-win in my book.

<h3 id="benchmarks-just-because">Benchmarks, just because :)


```csharp
[MemoryDiagnoser]
public class InitializationBenchmark
{
    [Benchmark]
    public IReadOnlyCollection<string> Instance()
    {
        var myClass = new MyClass();
        return myClass.MyStrings;
    }

    [Benchmark]
    public IReadOnlyCollection<string> Static()
    {
        var myClassStatic = new MyClassStatic();
        return myClassStatic.MyStrings;
    }
}

```


```
| Method   | Mean       | Error     | StdDev    | Gen0   | Allocated |
|--------- |-----------:|----------:|----------:|-------:|----------:|
| Instance | 16.8912 ns | 0.1127 ns | 0.0999 ns | 0.0134 |     112 B |
| Static   |  0.0141 ns | 0.0096 ns | 0.0080 ns |      - |         - |

```