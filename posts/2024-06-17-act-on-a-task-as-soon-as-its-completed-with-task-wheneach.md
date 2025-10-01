---
title: "Act on a Task as soon as it's completed with Task.WhenEach"
slug: act-on-a-task-as-soon-as-its-completed-with-task-wheneach
date: 2024-06-17T10:45:00.000Z
description: "Task.WhenEach allows us to act on a collection of tasks as they finish."
tags: ["dotnet","dotnet core","tips and tricks"]
---

You have the following code:


```csharp

public async Task RunJobs()
{
    var jobs = Enumerable.Range(1, 20).Select(DoSomeWork);
}


// Simulates some "real" work
private static async Task<(string JobName, TimeSpan ExecutionTime)> DoSomeWork(int jobIndex)
{
    var stopwatch = Stopwatch.StartNew();
    await Task.Delay(Random.Shared.Next(100, 250));
    stopwatch.Stop(); 
    return ($"Job {jobIndex}", stopwatch.Elapsed);
}

```


You want to act on each task as soon as it completes, rather than waiting for all tasks to complete.


A solution to this problem could look like this:


```csharp
var jobs = Enumerable.Range(1, 20).Select(DoSomeWork).ToList();

while (jobs.Any())
{
    var completedTask = await Task.WhenAny(jobs);
    jobs.Remove(completedTask);
    var result = await completedTask;
    Console.WriteLine($"Job done: {result.JobName} - Time: {result.ExecutionTime.TotalMilliseconds}ms");
}

```


This approach works, but it requires some "setup".

<h3 id="taskwheneach">Task.WhenEach


Starting with .NET 9, you can solve this by using `Task.WhenEach`.


```csharp
var jobs = Enumerable.Range(1, 20).Select(DoSomeWork);
await foreach (var job in Task.WhenEach(jobs))
{
    var result = await job;
    Console.WriteLine($"{result.JobName} is done, took {result.ExecutionTime.TotalMilliseconds}ms");
}

```


Since Task.WhenEach returns an `IAsyncEnumerable<Task>`, you can use `await foreach`. This loop will iterate over all the completed tasks as they finish, allowing you to act on finished tasks right away.