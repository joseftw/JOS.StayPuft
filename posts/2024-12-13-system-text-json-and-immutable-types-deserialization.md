---
title: "System.Text.Json and immutable types - Deserialization"
slug: system-text-json-and-immutable-types-deserialization
date: 2024-12-13T10:47:00.000Z
description: "This post shows how to serialize and deserialize immutable C# domain objects without using any attributes."
tags: ["c-sharp","dotnet","dotnet core"]
---

Imagine the following domain object for an Order:


```csharp
public class Order
{
    private HashSet<OrderLine> Lines { get; init; } = [];

    private Order() { }
    public required Guid Id { get; init; }
    public required DateTimeOffset Created { get; init; }

    public IReadOnlySet<OrderLine> GetLines()
    {
        return Lines;
    }

    public void AddOrderLine(OrderLine orderLine)
    {
        Lines.Add(orderLine);
    }

    public static Result<Order> Create(Guid id)
    {
        if(id.Equals(Guid.Empty))
        {
            return Result.Failure<Order>(
                new Error(ErrorType.NullOrEmpty, $"{nameof(id)} was null or empty"));
        }

        return Result.Success(new Order { Id = id, Created = TimeProvider.System.GetUtcNow() });
    }
}

```


Notice that we expose the order lines as an `IReadOnlySet<OrderLines>` via the `GetLines` method. If we were to expose the `HashSet<OrderLine>` directly, it would be possible to modify its content outside of our domain object.


```csharp
public record OrderLine
{
    private OrderLine() { }

    public required Guid Id { get; init; }
    public required string Name { get; init; }
    public required decimal Price { get; init; }

    public static Result<OrderLine> Create(Guid id, string name, decimal price)
    {
        if(id.Equals(Guid.Empty))
        {
            return Result.Failure<OrderLine>(
                new Error(ErrorType.NullOrEmpty, $"{nameof(id)} was null or empty"));
        }

        if(string.IsNullOrWhiteSpace(name))
        {
            return Result.Failure<OrderLine>(
                new Error(ErrorType.NullOrEmpty, $"{nameof(name)} was null or empty"));
        }

        if(price < 1)
        {
            return Result.Failure<OrderLine>(
                new Error(ErrorType.MinimumValue, $"{nameof(price)} needs to be greater than 0"));
        }

        return Result.Success(new OrderLine { Id = id, Name = name, Price = price });
    }
}


```


Our domain objects needs to be:

<ul>
<li>"Immutable"<br>
I wrote **immutable** in quotes because they are "immutable-ish":</li>
</ul>
<blockquote>

A domain object should be immutable to ensure consistency, reliability, and simplicity. When objects are immutable, their state cannot be changed after creation, preventing unintended side effects or bugs that arise from unexpected modifications.

</blockquote>

*Our* definition of immutability in this post is that it should not be possible to change the properties directly. You must use the appropriate methods, like `AddOrderLine` in our `Order` example above.

<ul>
<li>Only possible to create via the `Create` method - that's why we have a private default constructor.</li>
</ul>

```csharp
// This is not possible &#x2014; it's not possible to call new since the constructor is private
var order = new Order(...);

```


```csharp
// This is how we can create an order
var order = Order.Create(Guid.NewGuid());

```

<ul>
<li>Possible to persist</li>
</ul>

This post will focus on the last bullet point: **possible to persist.**


What I mean by this is that it should be possible to store our domain object, as-is, in a database or any other type of storage. We will **NOT** allow any kind of attributes or other "third-party stuff" to leak into our domain object.


For this post, we will assume that we're storing our domain object in a key-value store as JSON.

<h2 id="serialization">Serialization


I created a new class, `OrderSerializer`, to better encapsulate all the serialization/deserialization logic.


```csharp
public static class OrderSerializer
{
    private static readonly JsonSerializerOptions JsonSerializerOptions;

    static OrderSerializer()
    {
        JsonSerializerOptions = new JsonSerializerOptions
        {
            DictionaryKeyPolicy = JsonNamingPolicy.CamelCase,
            PropertyNameCaseInsensitive = true,
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase
        };
    }

    public static string Serialize(Order order)
    {
        return JsonSerializer.Serialize(order, JsonSerializerOptions);
    }

    public static Result<Order> Deserialize(string orderJson)
    {
        try
        {
            var result = JsonSerializer.Deserialize<Order>(orderJson, JsonSerializerOptions);
            return result is not null
                ? Result.Success(result)
                : Result.Failure<Order>(
                    new Error(ErrorType.Deserialization, "Order was null after deserialization"));
        }
        catch(Exception e)
        {
            return Result.Failure<Order>(new Error(ErrorType.Deserialization, e.Message));
        }
    }
}

```


Let's write a test to ensure that we can serialize the order correctly.


```csharp
[Fact]
public void CanSerializeAnOrder()
{
    var order = Order.Create(Guid.NewGuid()).Data;
    var orderLine = OrderLine.Create(Guid.NewGuid(), "iPhone 16 Pro", 14990).Data;
    order.AddOrderLine(orderLine);

    var serialized = OrderSerializer.Serialize(order);

    serialized.ShouldNotBeNull();
    var jsonDocument = JsonDocument.Parse(serialized);
    jsonDocument.RootElement.TryGetProperty("id", out var idProperty).ShouldBeTrue();
    idProperty.GetGuid().ShouldBe(order.Id);
    jsonDocument.RootElement.TryGetProperty("created", out var createdProperty).ShouldBeTrue();
    createdProperty.GetDateTimeOffset().ShouldBe(order.Created);
    jsonDocument.RootElement.TryGetProperty("lines", out var linesProperty).ShouldBeTrue();
    var lines = linesProperty.EnumerateArray().ToList();
    lines.Count.ShouldBe(1);
}

```


...it turns out that the serialization isn't as straightforward as we hoped. The test fails with the following error:


```
jsonDocument.RootElement.TryGetProperty("lines", out var linesProperty)
    should be
True
    but was
False

```


Let's have a look at the produced json:


```
{ 
  "id":"85799020-2642-4eb3-9449-03e66aa5e1d1",
  "created":"2024-12-13T10:02:41.024379+00:00"
}

```


Where are our order lines?


Since our `Lines` property is `private`, it won't be included in the serialized output by default. Let's fix that.


By adding the `[JsonInclude]` attribute on our `Lines` property like this...


```csharp
[JsonInclude]
private HashSet<OrderLine> Lines { get; } = [];

```


...the following json is produced:


```
{
  "lines" : [ {
    "id" : "04cecd46-b119-4ca1-8549-b6e8f84279b0",
    "name" : "iPhone 16 Pro",
    "price" : 14990
  } ],
  "id" : "cf16b155-45e9-40b7-a0dc-856437d30f3f",
  "created" : "2024-12-13T10:05:31.009223+00:00"
}

```


Now, for some people, this is a good enough solution. But remember when I said **We will NOT allow any kind of attributes or other "third-party stuff" to leak into our domain object**?


Let&#x2019;s see if we can fix this **without** adding the attribute.


[EF Core has great support for customizing how properties](https://learn.microsoft.com/en-us/ef/core/modeling?WT.mc_id=DT-MVP-5004074) has should be handled when persisting them in the database. They have a fluent api so that you don't need to add attributes to your models.


Turns out that System.Text.Json has something similar called [**JsonTypeInfo**](https://learn.microsoft.com/en-us/dotnet/api/system.text.json.serialization.metadata.jsontypeinfo?view=net-9.0?WT.mc_id=DT-MVP-5004074).

<h3 id="include-private-properties">Include private properties


First, let's update our `JsonSerializerOptions` to look like this:


```csharp
JsonSerializerOptions = new JsonSerializerOptions
{
    DictionaryKeyPolicy = JsonNamingPolicy.CamelCase,
    PropertyNameCaseInsensitive = true,
    PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
    TypeInfoResolver = new DefaultJsonTypeInfoResolver
    {
        Modifiers = { OrderJsonTypeInfoModifier }
    }
};

```


We've added a new `Modifier` called `OrderJsonTypeInfoModifier`, which looks like this:


```csharp
private static void OrderJsonTypeInfoModifier(JsonTypeInfo jsonTypeInfo)
{
    if (jsonTypeInfo.Type != typeof(Order))
    {
        return;
    }

    foreach (var property in jsonTypeInfo.Type.GetProperties(BindingFlags.Instance | BindingFlags.NonPublic))
    {
        var jsonPropertyInfo = jsonTypeInfo.CreateJsonPropertyInfo(property.PropertyType, property.Name);
        jsonPropertyInfo.Get = property.GetValue;
        jsonPropertyInfo.Set = property.SetValue;
        jsonTypeInfo.Properties.Add(jsonPropertyInfo);
    }
}

```


With reflection, we're getting all non-public properties and adding them to the `Properties` collection on the `JsonTypeInfo`. This means that our private property `Lines` will now be included when we serialize our `Order`.


When running the test again, it still fails. The following json is produced:


```
{
  "id" : "e5643ca0-aa82-4f49-bbdd-50ae3d569e6e",
  "created" : "2024-12-13T10:13:35.631702+00:00",
  "Lines" : [ {
    "id" : "d8498372-5ad7-47f4-bc29-0d920d8ce5d1",
    "name" : "iPhone 16 Pro",
    "price" : 14990
  } ]
}

```


The problem is that the `Lines` property name isn't camel-cased. The only thing left to fix is the name of the property, we don&#x2019;t want it to start with an uppercase.


```csharp
// Naive camel-case method
internal static class StringExtensions
{
    internal static string ToCamelCase(this string str)
    {
        if(string.IsNullOrWhiteSpace(str))
        {
            return str;
        }

        if(str.Length == 1)
        {
            return str.ToLower();
        }

        return char.ToLower(str[0]) + str[1..];
    }
}

```


```csharp
private static void OrderJsonTypeInfoModifier(JsonTypeInfo jsonTypeInfo)
{
    if(jsonTypeInfo.Type != typeof(Order))
    {
        return;
    }

    foreach(var property in jsonTypeInfo.Type.GetProperties(BindingFlags.Instance | BindingFlags.NonPublic))
    {
       // We're now using the ToCamelCase extension when setting the name
        var jsonPropertyInfo =
            jsonTypeInfo.CreateJsonPropertyInfo(property.PropertyType, property.Name.ToCamelCase());
        jsonPropertyInfo.Get = property.GetValue;
        jsonPropertyInfo.Set = property.SetValue;
        jsonTypeInfo.Properties.Add(jsonPropertyInfo);
    }
}

```


Now, when we run the test again, it passes, and the following JSON is produced:


```
{
  "id" : "ae135b77-c706-46c5-b480-84ecb1b94cfe",
  "created" : "2024-12-13T10:19:38.121274+00:00",
  "lines" : [ {
    "id" : "b76be9b8-991e-4ac0-a2c8-cd5581863782",
    "name" : "iPhone 16 Pro",
    "price" : 14990
  } ]
}

```


We can now correctly **serialize** an `Order`.

<h2 id="deserialization">Deserialization


Let's write a test and see if we can deserialize an `Order` that has been serialized by our `OrderSerializer`.


```csharp
[Fact]
public void CanDeserializeASerializedOrder()
{
    var order = Order.Create(Guid.NewGuid()).Data;
    var orderLine = OrderLine.Create(Guid.NewGuid(), "iPhone 16 Pro", 14990).Data;
    order.AddOrderLine(orderLine);
    var serialized = OrderSerializer.Serialize(order);

    var result = OrderSerializer.Deserialize(serialized);

    result.Succeeded.ShouldBeTrue(result.Error?.ErrorMessage);
    result.Data.Id.ShouldBe(order.Id);
    result.Data.Created.ShouldBe(order.Created);
    var orderLines = result.Data.GetLines();
    orderLines.Count.ShouldBe(1);
    orderLines.ShouldContain(orderLine);
}

```


The test fails with the following error:


```
Deserialization of types without a parameterless constructor, a singular parameterized constructor, or a parameterized constructor annotated with 'JsonConstructorAttribute' is not supported. Type 'JOS.ImmutableSerialization.Order'

```


We **do** have a parameterless constructor. But it&#x2019;s private, because we don&#x2019;t want people to be able to create new instances without using the `Create` method.


Let&#x2019;s start by adding the `[JsonConstructor]` attribute to our constructor and see if it helps.


It solves the problem for the `Order` object, but now we get a similar error for our `OrderLine` object:


```
Deserialization of types without a parameterless constructor, a singular parameterized constructor, or a parameterized constructor annotated with 'JsonConstructorAttribute' is not supported. Type 'JOS.ImmutableSerialization.OrderLine'.

```


If we add the `[JsonConstructor]` attribute to the private `OrderLine` constructor, the test passes.


But is it possible to make the test pass **without** having to add any attributes to our domain object?


Indeed, it is.


When using `JsonTypeInfo`, it's possible to specify how an instance should be created. The serializer needs to be able to create an instance before populating the properties.


A private constructor is not considered, by default.


Let's update our `OrderJsonTypeInfoModifier` a bit:


```csharp
private static void OrderJsonTypeInfoModifier(JsonTypeInfo jsonTypeInfo)
{
    if(jsonTypeInfo.Type != typeof(Order))
    {
        return;
    }

    foreach(var property in jsonTypeInfo.Type.GetProperties(BindingFlags.Instance | BindingFlags.NonPublic))
    {
        var jsonPropertyInfo =
            jsonTypeInfo.CreateJsonPropertyInfo(property.PropertyType, property.Name.ToCamelCase());
        jsonPropertyInfo.Get = property.GetValue;
        jsonPropertyInfo.Set = property.SetValue;
        jsonTypeInfo.Properties.Add(jsonPropertyInfo);
    }

    CreateFactoryMethodForObject(jsonTypeInfo);
}

private static void CreateFactoryMethodForObject(JsonTypeInfo typeInfo)
{
    var constructor = typeInfo.Type.GetConstructor(BindingFlags.Instance | BindingFlags.NonPublic, []);
    typeInfo.CreateObject = () => constructor!.Invoke(null);
}

```


The `JsonTypeInfo` has a property called `CreateObject`. By using reflection we can retrieve our private constructor and then populate the `CreateObject` property with a `Func` that invokes the constructor.


We need to do this for both the `Order` and `OrderLine` object. Our complete `OrderSerializer` now looks like this:


```csharp
public static class OrderSerializer
{
    private static readonly JsonSerializerOptions JsonSerializerOptions;

    static OrderSerializer()
    {
        JsonSerializerOptions = new JsonSerializerOptions
        {
            DictionaryKeyPolicy = JsonNamingPolicy.CamelCase,
            PropertyNameCaseInsensitive = true,
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
            TypeInfoResolver = new DefaultJsonTypeInfoResolver
            {
                Modifiers = { OrderJsonTypeInfoModifier, OrderLineJsonTypeInfoModifier }
            }
        };
    }

    public static string Serialize(Order order)
    {
        return JsonSerializer.Serialize(order, JsonSerializerOptions);
    }

    public static Result<Order> Deserialize(string orderJson)
    {
        try
        {
            var result = JsonSerializer.Deserialize<Order>(orderJson, JsonSerializerOptions);
            return result is not null
                ? Result.Success(result)
                : Result.Failure<Order>(
                    new Error(ErrorType.Deserialization, "Order was null after deserialization"));
        }
        catch(Exception e)
        {
            return Result.Failure<Order>(new Error(ErrorType.Deserialization, e.Message));
        }
    }

    private static void OrderJsonTypeInfoModifier(JsonTypeInfo jsonTypeInfo)
    {
        if(jsonTypeInfo.Type != typeof(Order))
        {
            return;
        }

        foreach(var property in jsonTypeInfo.Type.GetProperties(BindingFlags.Instance | BindingFlags.NonPublic))
        {
            var jsonPropertyInfo =
                jsonTypeInfo.CreateJsonPropertyInfo(property.PropertyType, property.Name.ToCamelCase());
            jsonPropertyInfo.Get = property.GetValue;
            jsonPropertyInfo.Set = property.SetValue;
            jsonTypeInfo.Properties.Add(jsonPropertyInfo);
        }

        CreateFactoryMethodForObject(jsonTypeInfo);
    }

    private static void OrderLineJsonTypeInfoModifier(JsonTypeInfo jsonTypeInfo)
    {
        if(jsonTypeInfo.Type != typeof(OrderLine))
        {
            return;
        }

        CreateFactoryMethodForObject(jsonTypeInfo);
    }

    private static void CreateFactoryMethodForObject(JsonTypeInfo typeInfo)
    {
        var constructor = typeInfo.Type.GetConstructor(BindingFlags.Instance | BindingFlags.NonPublic, []);
        typeInfo.CreateObject = () => constructor!.Invoke(null);
    }
}

```


And that&#x2019;s it&#x2014;serialization and deserialization of our immutable objects now work perfectly fine.