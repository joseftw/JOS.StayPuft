---
title: "Stream files from Postgres - dotnet core"
slug: stream-files-from-postgres-dotnet-core
date: 2025-02-21T10:39:48.000Z
description: "Streaming files from a database without allocating like crazy? Let's see how we can stream files from Postgres with dotnet core and npgsql."
tags: ["asp.net core","dotnet core","dotnet","postgres","stream"]
---

This is a follow up to my previous post [Stream files to Postgres](https://josef.codes/streaming-files-to-postgres-dotnet-core/).

<h2 id="scenario">Scenario


Due to reasons I cannot reveal, I have a situation where I have some images stored in a Postgres database, in a `bytea` column.<br>
Lovely.<br>
<img src="https://josef.codes/content/images/2025/02/postgres-screenshot.png" alt="postgres-screenshot.png" loading="lazy">


The size of the images varies between 100kB all the way up to 10MB.


Now, I want to display theses images on a webpage, without allocationg like crazy. Let's see how we can do that.

<h2 id="code">Code


A naive approach would be to simply load the column as a `byte[]` and return it to the client. However, this means our API would need to load the entire image into memory before returning it to the client, which is inefficient and potentially dangerous. Imagine if someone triggers 100 requests for a large image, and we don&#x2019;t have any caching or a CDN in place...


The solution to this problem, as always, is `Stream`. Whenever you do some I/O, http calls, handling files, json etc, you should always strive to use streams. I have written [many](https://josef.codes/streaming-files-to-postgres-dotnet-core/) [articles](https://josef.codes/using-embedded-files-in-dotnet-core/) [about this](https://josef.codes/sorting-really-large-files-with-c-sharp/) [before.](https://josef.codes/efficient-file-uploads-with-dotnet/)

<h3 id="entites-etc">Entites etc


We have the following entities ([complete project can be found over at GitHub.](https://github.com/joseftw/stream-database)).


```csharp
public abstract class Entity<T> : IEquatable<Entity<T>>
{
    public required T Id { get; init; }

    public bool Equals(Entity<T>? other)
    {
        if(other is null)
        {
            return false;
        }

        if(!Id!.Equals(other.Id))
        {
            return false;
        }

        return this.GetType() == other.GetType();
    }

    public override bool Equals(object? obj)
    {
        return obj is Entity<T> entity && Equals(entity);
    }

    public override int GetHashCode()
    {
        return EqualityComparer<T>.Default.GetHashCode(Id!);
    }
}

public class RealEstate : Entity<Guid>
{
    private List<RealEstateImage> _images = null!;

    public const int NameMaxLength = 255;
    public required string Name { get; init; }
    public IReadOnlyCollection<RealEstateImage> Images => _images;

    public static Result<RealEstate> Create(
        Guid id, string name, IReadOnlyCollection<RealEstateImage>? images = null)
    {
        if(string.IsNullOrWhiteSpace(name))
        {
            return new FailedResult<RealEstate>(new NullOrEmptyError(nameof(name)));
        }

        if(name.Length > NameMaxLength)
        {
            return new FailedResult<RealEstate>(new ValueTooLongError(NameMaxLength, name.Length, name));
        }

        return new SucceededResult<RealEstate>(new RealEstate
        {
            Id = id,
            _images = images?.ToList() ?? [],
            Name = name
        });
    }
}

public class RealEstateImage : ImageFile
{
    private RealEstateImage() {}
    public required Guid RealEstateId { get; init; }

    public static Result<RealEstateImage> Create(
        Guid id, Guid realEstateId, Stream data, ImageMetadata metadata)
    {
        if(id.Equals(Guid.Empty))
        {
            return new FailedResult<RealEstateImage>(new NullOrEmptyError(nameof(id)));
        }

        if(realEstateId.Equals(Guid.Empty))
        {
            return new FailedResult<RealEstateImage>(new NullOrEmptyError(nameof(realEstateId)));
        }

        var image =
            new RealEstateImage { Id = id, Data = data, Metadata = metadata, RealEstateId = realEstateId };
        return new SucceededResult<RealEstateImage>(image);
    }
}

public abstract class ImageFile : File<ImageMetadata>
{
    public override FileType Type { get; init; } = FileType.Image;
}

public abstract class File : Entity<Guid>
{
    private protected FileMetadata _metadata = null!;
    private protected Stream Data = Stream.Null;
    public abstract FileType Type { get; init; }
    public abstract FileMetadata GetMetadata();

    public async Task<Result.Result> Save(ISaveFileCommand saveFileCommand)
    {
        if(Data.Equals(Stream.Null) || !Data.CanRead)
        {
            return Result.Result.Failure(new ValidationError("The Data stream needs to be readable"));
        }

        return await saveFileCommand.Execute(this, Data);
    }
}

public abstract class File<T> : File where T : FileMetadata
{
    protected File()
    {
        _metadata = Metadata;
    }

    public required T Metadata { get; init; } = null!;

    public override T GetMetadata()
    {
        return Metadata;
    }
}

public abstract class FileMetadata
{
    public required long Size { get; init; }
    public required string MimeType { get; init; }
    public required string Filename { get; init; }
    public required string Extension { get; init; }
}

public class ImageMetadata : FileMetadata
{
    private ImageMetadata() { }

    public static Result<ImageMetadata> Create(long size, Dictionary<string, object> metadata)
    {
        // ExtractBaseMetadata is just a helper that extracts the
        // extension, filename and mime type from the provided dictionary.

        var extractBaseMetadataResult = metadata.ExtractBaseMetadata();
        if(extractBaseMetadataResult.Failed)
        {
            return new FailedResult<ImageMetadata>(extractBaseMetadataResult.Error!);
        }

        var baseMetadata = extractBaseMetadataResult.Data;
        var imageMetadata = new ImageMetadata
        {
            Extension = baseMetadata.Extension,
            Filename = baseMetadata.Filename,
            MimeType = baseMetadata.MimeType,
            Size = size
        };

        return new SucceededResult<ImageMetadata>(imageMetadata);
    }
}

```


EF Core is used to handle migrations:


```csharp
internal class RealEstateEntityTypeConfiguration : IEntityTypeConfiguration<RealEstate>
{
    public void Configure(EntityTypeBuilder<RealEstate> builder)
    {
        builder.HasKey(x => x.Id);
        builder.Property(x => x.Name).IsRequired();
        builder.Ignore(x => x.Images);
        builder.HasMany<RealEstateImage>("_images").WithOne();
        builder.Navigation("_images").AutoInclude();
    }
}

internal class RealEstateImageEntityTypeConfiguration : IEntityTypeConfiguration<RealEstateImage>
{
    public void Configure(EntityTypeBuilder<RealEstateImage> builder)
    {
        builder.ConfigureImage();
        builder.Property(x => x.RealEstateId).IsRequired();
    }
}

```


When the migration has run, we have two tables:<br>
**real_estate**


```
id, name
d1ff5e47-12fe-4ff4-921e-c74c93b07739,My house

```


**real_estate_images**


```
id, real_estate_id, data, type, metadata
019513e8-77e4-7877-a57b-7b91e4fa2952,d1ff5e47-12fe-4ff4-921e-c74c93b07739,{binaryData}, 1, {"Size": 112818, "Filename": "my-image.jpg", "MimeType": "image/jpg", "Extension": "jpg"}

```

<h3 id="streaming-the-image">Streaming the image


The image endpoint will look like this:<br>
`/real-estate/{realEstateId}/images/{imageId}`


The endpoint is configured like this:


```csharp
app.MapGet("/real-estate/{realEstateId:guid}/images/{imageId:guid}", RealEstateImageEndpoint.Handle)
   .WithName("ReadRealEstateImage");
``

```csharp
public static class RealEstateImageEndpoint
{
    public static async Task<IResult> Handle(
        [FromRoute] Guid realEstateId, [FromRoute] Guid imageId, [FromServices] RealEstateImageQueryHandler handler)
    {
        var result = await handler.Handle(realEstateId, imageId);
        if(result.Failed)
        {
            return result.Error.ErrorType switch
            {
                "NotFound" => Results.Problem(statusCode: StatusCodes.Status404NotFound, title: "Not Found",
                    detail: result.Error.ErrorMessage),
                _ => Results.InternalServerError("Something bad happened...")
            };
        }

        return Results.Stream(result.Data.Data, result.Data.MimeType);
    }
}

```


As you can see, besides from some error handling, the endpoint just returns the image as a `Stream`. The interesting stuff happens in the `RealEstateImageQueryHandler`.


```csharp
public class RealEstateImageQueryHandler
{
    private readonly NpgsqlConnection _dbConnection;

    public RealEstateImageQueryHandler(NpgsqlConnection dbConnection)
    {
        _dbConnection = dbConnection ?? throw new ArgumentNullException(nameof(dbConnection));
    }

    public async Task<Result<ReadRealEstateImageModel>> Handle(Guid realEstateId, Guid imageId)
    {
        const string sql =
            """
            SELECT id, data, metadata->>'MimeType' as mimeType FROM real_estate_images
            WHERE id = @imageId AND real_estate_id = @realEstateId
            """;
        await _dbConnection.OpenAsync();
        await using var cmd = new NpgsqlCommand(sql, _dbConnection);
        cmd.Parameters.Add(new() { ParameterName = "realEstateId", Value = realEstateId });
        cmd.Parameters.Add(new() { ParameterName = "imageId", Value = imageId });

        var reader = await cmd.ExecuteReaderAsync();
        if(!reader.HasRows)
        {
            return new FailedResult<ReadRealEstateImageModel>(new Error("NotFound", "Image was not found"));
        }

        await reader.ReadAsync();
        var id = reader.GetGuid("id");
        var mimeType = reader.GetString("mimeType");
        var data = await reader.GetStreamAsync(reader.GetOrdinal("data"));
        return new SucceededResult<ReadRealEstateImageModel>(new ReadRealEstateImageModel
        {
            Id = id, Data = data, MimeType = mimeType
        });
    }
}

```


I'm using `NpgsqlCommand` to interact with the database, as EF Core doesn't provide a good way to stream a column (to my knowledge).


The handler does the following:

<ul>
<li>Creates the SQL query</li>
<li>Executes the SQL query</li>
<li>Uses `NpgsqlDataReader` to handle the column mapping ourselves.</li>
</ul>

The key part here is the `GetStreamAsync` method on the data column. This provides a stream that represents the data in the data column &#x2014; the actual image.


We also return the image's MIME type so that we can set the correct response headers in our endpoint.

<h2 id="final-thoughts">Final thoughts


The code that handles the actual streaming of the image is fairly straightforward. The most challenging part was dealing with Entity Framework to ensure it generated the correct migrations. Since my models are immutable, some workarounds were necessary to make it all function properly. Additionally, I found that streaming the data *to* the database was much more difficult than streaming it *from* the database. You can read more about that [here](https://josef.codes/streaming-files-to-postgres-dotnet-core/). [The full project is available at GitHub](https://github.com/joseftw/stream-database).