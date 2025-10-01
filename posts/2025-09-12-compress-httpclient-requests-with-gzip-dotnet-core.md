---
title: "Compress HttpClient requests with GZIP"
slug: compress-httpclient-requests-with-gzip-dotnet-core
date: 2025-09-12T08:35:01.000Z
description: "By streaming the gzip compression instead of using MemoryStream, we can significantly reduce memory allocation and avoid OutOfMemoryExceptions with large payloads."
tags: ["dotnet core","dotnet","performance","stream","httpclient"]
---

In a project I'm part of, I found that we had some code that gzipped some requests before sending them to an external API. I found it because of some performance problems, especially with larger files. More specifically, we ran out of memory...


Here's the code:


```csharp
internal async ValueTask<HttpRequestMessage> CreateRequest(Uri uri, Stream source)
{
    var outStream = new MemoryStream();
    await using (var zipStream = new GZipStream(outStream, CompressionMode.Compress, leaveOpen: true))
    {
        await source.CopyToAsync(zipStream);
        zipStream.Close();
    }
    outStream.Position = 0;

    var request = new HttpRequestMessage(HttpMethod.Post, uri)
    {
        Content = new StreamContent(outStream)
    };
    request.Content.Headers.ContentEncoding.Add("gzip");
    return request;
}

```


It was then used like this:


```csharp
var uri = new Uri("https://dummy.localhost/some-endpoint");
var someLargeFile = File.Open("some-really-large-file.txt");
var request = await CreateRequest(uri, someLargeFile);

```


Usually, this code just worked. However, sometimes we needed to send a lot of these requests. And every time a request was sent, the gzipped content would be created in memory (thanks to the MemoryStream) before it would be sent. And since memory is a finite resource, the app would go boom.


My idea was that, surely, it should be possible to do the gzip compression on the fly instead?


I came up with the following:


```csharp
public class GzipContent : HttpContent
{
    private readonly Stream _sourceStream;

    public GzipContent(Stream sourceStream)
    {
        _sourceStream = sourceStream;
        Headers.ContentEncoding.Add("gzip");
    }

    protected override async Task SerializeToStreamAsync(Stream stream, TransportContext? context)
    {
        await using var gzipStream = new GZipStream(stream, CompressionMode.Compress, leaveOpen: true);
        await _sourceStream.CopyToAsync(gzipStream);
    }

    protected override bool TryComputeLength(out long length)
    {
        length = -1;
        return false;
    }
}

```


You use it in the same way like this:


```csharp
var uri = new Uri("https://dummy.localhost/some-endpoint");
var someLargeFile = File.Open("some-really-large-file.txt");
var request = await CreateRequest(uri, someLargeFile);

// ValueTask<> is used since the `CreateRequest` method is part of an interface and to make the benchmark more fair as well.
internal ValueTask<HttpRequestMessage> CreateRequest(Uri uri, Stream source)
{
    return ValueTask.FromResult(new HttpRequestMessage(HttpMethod.Post, uri)
    {
        Content = new GzipContent(source)
    });
}

```

<h2 id="performance">Performance


I benchmarked this with a couple of different json files of different sizes. The `GzipContent` version runs a tad slower for smaller files, but it allocates way less, thus solving our memory problem. The bigger the file, the bigger the difference.


```
BenchmarkDotNet v0.15.2, macOS 26.0 (25A353) [Darwin 25.0.0]
Apple M4 Max, 1 CPU, 16 logical and 16 physical cores
.NET SDK 10.0.100-preview.7.25380.108
  [Host]   : .NET 9.0.7 (9.0.725.31616), Arm64 RyuJIT AdvSIMD
  .NET 9.0 : .NET 9.0.7 (9.0.725.31616), Arm64 RyuJIT AdvSIMD

Job=.NET 9.0  Runtime=.NET 9.0  InvocationCount=1  
UnrollFactor=1  

| Method       | Filename   | Mean        | Error     | StdDev    | Median      | Ratio | RatioSD | Allocated  | Alloc Ratio |
|------------- |----------- |------------:|----------:|----------:|------------:|------:|--------:|-----------:|------------:|
| MemoryStream | 64KB.json  |    238.5 us |   7.20 us |  19.96 us |    234.7 us |  1.01 |    0.11 |   27.69 KB |        1.00 |
| GzipContent  | 64KB.json  |    244.1 us |   7.87 us |  21.81 us |    239.1 us |  1.03 |    0.12 |    7.94 KB |        0.29 |
|              |            |             |           |           |             |       |         |            |             |
| MemoryStream | 128KB.json |    763.4 us |  25.93 us |  73.54 us |    737.8 us |  1.01 |    0.13 |  123.85 KB |        1.00 |
| GzipContent  | 128KB.json |    735.2 us |  14.62 us |  36.13 us |    730.6 us |  0.97 |    0.10 |    7.66 KB |        0.06 |
|              |            |             |           |           |             |       |         |            |             |
| MemoryStream | 256KB.json |    702.9 us |  13.99 us |  30.11 us |    701.1 us |  1.00 |    0.06 |  123.85 KB |        1.00 |
| GzipContent  | 256KB.json |    732.2 us |  13.12 us |  34.78 us |    731.1 us |  1.04 |    0.07 |    7.81 KB |        0.06 |
|              |            |             |           |           |             |       |         |            |             |
| MemoryStream | 512KB.json |  1,360.0 us |  27.13 us |  52.91 us |  1,354.7 us |  1.00 |    0.05 |  123.85 KB |        1.00 |
| GzipContent  | 512KB.json |  1,425.9 us |  28.31 us |  62.74 us |  1,431.2 us |  1.05 |    0.06 |     8.3 KB |        0.07 |
|              |            |             |           |           |             |       |         |            |             |
| MemoryStream | 1MB.json   |  2,663.8 us |  52.87 us | 144.73 us |  2,647.0 us |  1.00 |    0.08 |  252.03 KB |        1.00 |
| GzipContent  | 1MB.json   |  2,744.1 us |  54.47 us | 130.50 us |  2,732.7 us |  1.03 |    0.07 |    9.05 KB |        0.04 |
|              |            |             |           |           |             |       |         |            |             |
| MemoryStream | 5MB.json   | 12,914.2 us | 249.61 us | 324.56 us | 12,870.5 us |  1.00 |    0.03 | 2046.29 KB |       1.000 |
| GzipContent  | 5MB.json   | 12,802.1 us | 250.62 us | 234.43 us | 12,777.7 us |  0.99 |    0.03 |   16.28 KB |       0.008 |

```