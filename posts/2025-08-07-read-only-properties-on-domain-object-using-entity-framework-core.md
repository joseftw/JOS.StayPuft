---
title: "Read only properties on Domain object using Entity Framework Core"
slug: read-only-properties-on-domain-object-using-entity-framework-core
date: 2025-08-07T11:55:42.000Z
description: "Storing immutable domain objects directly with Entity Framework Core using value converters and private backing fields to handle read-only collections and custom types."
tags: ["dotnet","dotnet core","entity framework","jos.enumeration"]
---

I'm all in on storing my domain objects in my database. Previously, I used specific "storage DTOs" and mapped between them. Nothing wrong with that, since that gives you full control. However, if we can skip the mapping, who am I if I don't do just that?


My domain objects are always immutable. It's only possible to create them via a static factory method which contains all validation.<br>
When exposing collections, I always use interfaces similar to `IEnumerable`, `IReadOnlyCollection`, `IReadOnlySet` etc.


So, with that background in mind, let's see how we can use Entity Framework Core to store my domain objects.


The following object will be used:


```csharp
public class Car
{
    private Car() { }

    public required Guid Id { get; init; }
    public required string Name { get; init; }
    public required IReadOnlySet<string> Tags { get; init; }

    public static Result<Car> Create(Guid id, string name, IReadOnlySet<string> tags)
    {
        // Validation etc...

        return Result.Success(new Car
        {
            Id = id,
            Name = name,
            Tags = tags
        });
    }
}

```


I configure my entities using `IEntityTypeConfiguration`. Reasoning for naming it `PostgresDbContext` is that my application supports multiple different databases, this post focus on Postgres.


```csharp
public class PostgresDbContext : MyProjectDbContext
{
    public PostgresDbContext(DbContextOptions<PostgresDbContext> options) : base(options)
    {
    }

    protected override void ConfigureModel(ModelBuilder modelBuilder)
    {
        var postgresAssembly = this.GetType().Assembly;
        var postgresNamespace = this.GetType().Namespace!;
        modelBuilder.ApplyConfigurationsFromAssembly(
            postgresAssembly, type => type.Namespace is not null && type.Namespace.StartsWith(postgresNamespace));
    }
}

```


```csharp
public class CarEntityConfiguration : IEntityTypeConfiguration<Car>
{
    public void Configure(EntityTypeBuilder<Car> builder)
    {
        builder.HasKey(x => x.Id);
        builder.Property(x => x.Name).IsRequired().HasMaxLength(Car.NameMaxLength);
        builder.PrimitiveCollection(x => x.Tags);
    }
}

```


That's a basic setup. All classes that implement `IEntityTypeConfiguration` in the same assembly *and* namespace as my `PostgresDbContext` will be applied automatically. We're also using the [Primitive Collection feature.](https://learn.microsoft.com/en-us/ef/core/what-is-new/ef-core-8.0/whatsnew?WT.mc_id=DT-MVP-5004074#primitive-collection-properties)


Let's try to create a migration and see what happens.


```csharp
dotnet ef migrations add AddCarEntity --project src/MyProject.Storage --startup-project src/MyProject.Storage.Migrator --context PostgresDbContext --output-dir Migrations/Postgres --verbose

```


The following migration was created:


```csharp
public partial class AddCarEntity : Migration
{
    /// <inheritdoc />
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.CreateTable(
            name: "car",
            columns: table => new
            {
                id = table.Column<Guid>(type: "uuid", nullable: false),
                name = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: false),
                tags = table.Column<IReadOnlySet<string>>(type: "text[]", nullable: false)
            },
            constraints: table =>
            {
                table.PrimaryKey("pk_car", x => x.id);
            });
    }

    /// <inheritdoc />
    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropTable(name: "car");
    }
}

```


Worked like a charm. This post could've ended here. However, I don't want to use plain strings, I want to use predefined values from an [enumeration class](https://github.com/joseftw/jos.enumeration).


```csharp
public partial class CarFeature : IEnumeration<string, CarFeature>
{
    public static readonly CarFeature GPS = new("gps", "GPS");
    public static readonly CarFeature Bluetooth = new("bluetooth", "Bluetooth");
    public static readonly CarFeature Manual = new("manual", "Manual");
    public static readonly CarFeature Automatic = new("automatic", "Automatic");
}

```


My updated entity and configuration look like this:


```csharp
public class Car
{
    public const int NameMaxLength = 256;
    private Car() { }

    public required Guid Id { get; init; }
    public required string Name { get; init; }
    // Tags has been replaced with Features
    public required IReadOnlySet<CarFeature> Features { get; init; }

    public static Result<Car> Create(Guid id, string name, IReadOnlySet<CarFeature> features)
    {
        // Validation etc...
        return Result.Success(new Car
        {
            Id = id,
            Name = name,
            Features = features
        });
    }
}

```


```csharp
public class CarEntityConfiguration : IEntityTypeConfiguration<Car>
{
    public void Configure(EntityTypeBuilder<Car> builder)
    {
        builder.HasKey(x => x.Id);
        builder.Property(x => x.Name).IsRequired().HasMaxLength(Car.NameMaxLength);
        builder.PrimitiveCollection(x => x.Features);
    }
}

```


```csharp
dotnet ef migrations add AddCarFeatures --project src/MyProject.Storage --startup-project src/MyProject.Storage.Migrator --context PostgresDbContext --output-dir Migrations/Postgres --verbose

```


This does not work, EF does not know how to store my enumeration class.

<blockquote>

Unable to create a 'DbContext' of type 'PostgresDbContext'. The exception 'The 'IReadOnlySet<CarFeature>' property 'Car.Features' could not be mapped because the database provider does not support this type. Consider converting the property value to a type supported by the database using a value converter.

</blockquote>

We need to tell EF how to convert the enumeration. [My package contains a converter](https://github.com/joseftw/jos.enumeration/blob/main/src/JOS.Enumeration.Database.EntityFrameworkCore/EnumerationConverter.cs) that we can use.


```csharp
public class CarEntityConfiguration : IEntityTypeConfiguration<Car>
{
    public void Configure(EntityTypeBuilder<Car> builder)
    {
        builder.HasKey(x => x.Id);
        builder.Property(x => x.Name).IsRequired().HasMaxLength(Car.NameMaxLength);
        builder.PrimitiveCollection(x => x.Features)
               .ElementType()
               .HasConversion<EnumerationConverter<string, CarFeature>>();
    }
}

```


Let's try again:


```csharp
dotnet ef migrations add AddCarFeatures --project src/JEHO.Awth.Storage --startup-project src/JEHO.Awth.Storage.Migrator --context PostgresDbContext --output-dir Migrations/Postgres --verbose

```


```
Using application service provider from Microsoft.Extensions.Hosting.
Using context 'PostgresDbContext'.
Microsoft.EntityFrameworkCore.Design.OperationException: Unable to create a 'DbContext' of type 'PostgresDbContext'. The exception 'Exception has been thrown by the target of an invocation.' was thrown while attempting to create an instance. For the different patterns supported at design time, see https://go.microsoft.com/fwlink/?linkid=851728
 ---> System.Reflection.TargetInvocationException: Exception has been thrown by the target of an invocation.
 ---> System.ArgumentNullException: Value cannot be null. (Parameter 'constructor')
   at System.ArgumentNullException.Throw(String paramName)
   at System.ArgumentNullException.ThrowIfNull(Object argument, String paramName)
   at System.Linq.Expressions.Expression.New(ConstructorInfo constructor, IEnumerable`1 arguments)
   at Npgsql.EntityFrameworkCore.PostgreSQL.Storage.ValueConversion.NpgsqlArrayConverter`3.ArrayConversionExpression[TInput,TOutput,TConcreteOutput](LambdaExpression elementConversionExpression)
   at Npgsql.EntityFrameworkCore.PostgreSQL.Storage.ValueConversion.NpgsqlArrayConverter`3..ctor(ValueConverter elementConverter)
   at System.Reflection.MethodBaseInvoker.InterpretedInvoke_Constructor(Object obj, IntPtr* args)
   at System.Reflection.MethodBaseInvoker.InvokeDirectByRefWithFewArgs(Object obj, Span`1 copyOfArgs, BindingFlags invokeAttr)
   --- End of inner exception stack trace ---
   at System.Reflection.MethodBaseInvoker.InvokeDirectByRefWithFewArgs(Object obj, Span`1 copyOfArgs, BindingFlags invokeAttr)
   at System.Reflection.MethodBaseInvoker.InvokeWithOneArg(Object obj, BindingFlags invokeAttr, Binder binder, Object[] parameters, CultureInfo culture)
   at System.Reflection.RuntimeConstructorInfo.Invoke(BindingFlags invokeAttr, Binder binder, Object[] parameters, CultureInfo culture)
   at System.RuntimeType.CreateInstanceImpl(BindingFlags bindingAttr, Binder binder, Object[] args, CultureInfo culture)
   at Npgsql.EntityFrameworkCore.PostgreSQL.Storage.Internal.Mapping.NpgsqlArrayTypeMapping`3.CreateParameters(String storeType, RelationalTypeMapping elementMapping)
   at Npgsql.EntityFrameworkCore.PostgreSQL.Storage.Internal.Mapping.NpgsqlArrayTypeMapping`3..ctor(String storeType, RelationalTypeMapping elementTypeMapping)
   at Npgsql.EntityFrameworkCore.PostgreSQL.Storage.Internal.Mapping.NpgsqlArrayTypeMapping`3..ctor(RelationalTypeMapping elementTypeMapping)
   at System.Reflection.MethodBaseInvoker.InterpretedInvoke_Constructor(Object obj, IntPtr* args)
   at System.Reflection.MethodBaseInvoker.InvokeDirectByRefWithFewArgs(Object obj, Span`1 copyOfArgs, BindingFlags invokeAttr)
   --- End of inner exception stack trace ---
   at Microsoft.EntityFrameworkCore.Design.Internal.DbContextOperations.CreateContext(String contextType, KeyValuePair`2 contextPair)
   at Microsoft.EntityFrameworkCore.Design.Internal.DbContextOperations.CreateContext(String contextType)
   at Microsoft.EntityFrameworkCore.Design.Internal.MigrationsOperations.AddMigration(String name, String outputDir, String contextType, String namespace, Boolean dryRun)
   at Microsoft.EntityFrameworkCore.Design.OperationExecutor.AddMigrationImpl(String name, String outputDir, String contextType, String namespace, Boolean dryRun)
   at Microsoft.EntityFrameworkCore.Design.OperationExecutor.AddMigration.<>c__DisplayClass0_0.<.ctor>b__0()
   at Microsoft.EntityFrameworkCore.Design.OperationExecutor.OperationBase.<>c__DisplayClass3_0`1.<Execute>b__0()
   at Microsoft.EntityFrameworkCore.Design.OperationExecutor.OperationBase.Execute(Action action)
Unable to create a 'DbContext' of type 'PostgresDbContext'. The exception 'Exception has been thrown by the target of an invocation.' was thrown while attempting to create an instance. For the different patterns supported at design time, see https://go.microsoft.com/fwlink/?linkid=851728

```


That did not work. Something is null. An exception was thrown...and we don't get any more info than that. Nice! :)


Luckily I have encountered this error before, and I know how to fix it. First, we need to do some refactoring in our `Car` entity.


```csharp
public class Car
{
    public const int NameMaxLength = 256;
    private readonly HashSet<CareFeature> _features;

    private Car()
    {
        _features = [];
    }

    public required Guid Id { get; init; }
    public required string Name { get; init; }

    public required IReadOnlySet<CarFeature> Features
    {
        get
        {
            return _features;
        }
        init
        {
            _features = [.. value];
        }
    }

    public static Result<Car> Create(Guid id, string name, IReadOnlySet<CarFeature> features)
    {
        // Validation etc...
        return Result.Success(new Car
        {
            Id = id,
            Name = name,
            Features = features
        });
    }
}

```


A private `HashSet<CarFeature>` field has been added. This is key, it uses a concrete type instead of the interface. The public property `Features` has been refactored to set/get the `_features` field.


We then need to update our entity type configuration a bit.


```csharp
public class CarEntityConfiguration : IEntityTypeConfiguration<Car>
{
    public void Configure(EntityTypeBuilder<Car> builder)
    {
        builder.HasKey(x => x.Id);
        builder.Property(x => x.Name).IsRequired().HasMaxLength(Car.NameMaxLength);
        builder.Ignore(x => x.Features)
               .PrimitiveCollection("_features")
               .ElementType()
               .HasConversion<EnumerationConverter<string, CarFeature>>();
    }
}

```


First we tell Entity Framework to ignore the public `Features` property. We then say that the primitive collection uses the private `_features` field instead. And that's it.


I **don't** know WHY this is necessary, I only know that I have done this fix for ages. It's a bit weird to me that `IReadOnlyCollection<string>` works perfectly out of the box but `CarFeature` does not since we're converting to a string. If anyone knows why the "field workaround" is necessary, please comment below! :)