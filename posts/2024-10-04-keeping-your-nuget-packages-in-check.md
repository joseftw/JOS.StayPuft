---
title: "Keeping your nuget packages in check"
slug: keeping-your-nuget-packages-in-check
date: 2024-10-04T10:00:00.000Z
description: "It's important to keep your NuGet dependencies up to date. In this post, I'll share some tips and tricks for managing package updates effectively."
tags: ["dotnet","dotnet core","nuget"]
---

<h2 id="patch-tuesday-dependency-day">Patch Tuesday / Dependency Day


It's important to keep your dependencies up to date, as updates can contain security fixes, bug fixes, new features, and more.


Microsoft (and other companies) have something called "Patch Tuesday," where they release updates for their products.


In a project I'm currently part of, we've introduced a similar concept that we call **Dependency Day**.<br>
So what does Dependency Day mean?


Every Dependency Day, we review all the dependencies in our applications and update them. That's basically it.


Regularly updating packages is easier because it minimizes the number of changes you need to handle at once, reducing the risk of compatibility issues or breaking changes. Smaller, more frequent updates are also easier to test and troubleshoot than large, infrequent overhauls.


In the .NET world, there are some tools that simplify this process.

<h4 id="central-package-management">[Central Package Management](https://learn.microsoft.com/en-us/nuget/consume-packages/central-package-management?WT.mc_id=DT-MVP-5004074)</h4>

Central Package Management has **greatly** reduced the burden of keeping project dependencies in sync. No more *"Let&#x2019;s use four different versions of the same package"*. I **highly** recommend using it. Instead of specifying versions in the csproj files, you manage them in a single file, Directory.Packages.props. An example looks like this:


```
<Project>
  <PropertyGroup>
    <ManagePackageVersionsCentrally>true</ManagePackageVersionsCentrally>
  </PropertyGroup>
  <ItemGroup>
    <PackageVersion Include="BenchmarkDotNet" Version="0.14.0" />
    <PackageVersion Include="Dapper" Version="2.0.151" />
    <PackageVersion Include="Microsoft.SourceLink.GitHub" Version="8.0.0" />
    <PackageVersion Include="Microsoft.CodeAnalysis.Analyzers" Version="3.3.4" />
    <PackageVersion Include="Microsoft.CodeAnalysis.CSharp" Version="4.11.0" />
    <PackageVersion Include="Microsoft.NET.Test.Sdk" Version="17.11.1" />
    <PackageVersion Include="Shouldly" Version="4.2.1" />
    <PackageVersion Include="xunit" Version="2.9.0" />
    <PackageVersion Include="xunit.runner.visualstudio" Version="2.8.2">
      <PrivateAssets>all</PrivateAssets>
      <IncludeAssets>runtime; build; native; contentfiles; analyzers; buildtransitive</IncludeAssets>
    </PackageVersion>
  </ItemGroup>
  <ItemGroup>
    <GlobalPackageReference Include="Nerdbank.GitVersioning" Version="3.6.143">
      <PrivateAssets>all</PrivateAssets>
    </GlobalPackageReference>
  </ItemGroup>
</Project>

```


Your project will then reference the packages by using a `PackageReference`


```
<ItemGroup>
    <PackageReference Include="Dapper" />
    <PackageReference Include="Shouldly" />
  </ItemGroup>

```

<h4 id="dotnet-outdated">[dotnet-outdated](https://github.com/dotnet-outdated/dotnet-outdated)</h4>

dotnet-outdated is a CLI tool that allows you to update your packages smoothly.


Example:


```
dotnet outdated -u:Prompt
The package MyExamplePackage can be upgraded from 1.0.0 to 1.1.0
Do you wish to upgrade this package? [Y/n]

```


I've been a heavy user of this tool, but it currently doesn't handle `GlobalPackageReference` set in the **Directory.Packages.props** file when using Central Package Management.


To mitigate this, I've created a bash script that works similarly to dotnet-outdated, but it only supports Central Package Management.


Here's my script.


```
#!/bin/bash
set -e

backup_directory_packages_props=false
if [ "$1" == "--backup" ]; then
  backup_directory_packages_props=true
  shift
fi

include_prerelease=""
if [ "$1" == "--prerelease" ]; then
  include_prerelease="--include-prerelease"
fi

props_file="Directory.Packages.props"

packages=()

while IFS=' ' read -r package_name current_version latest_version; do
  packages+=("$package_name|$current_version|$latest_version")
done < <(dotnet list package $include_prerelease --outdated | grep '>' | awk '{print $2, $3, $5}' | sort | uniq)


for package_info in "${packages[@]}"; do
  IFS='|' read -r package_name current_version latest_version <<< "$package_info"

  if [ "$current_version" == "$latest_version" ]; then
      continue
  fi

  read -p "Update $package_name from $current_version to $latest_version? (y/n): " yn
  case $yn in
      [Yy]* )
          if [ "$backup_directory_packages_props" = true ]; then
              cp "$props_file" "$props_file.bak"
          fi
          sed -i '' -E "s|<PackageVersion Include=\"$package_name\" Version=\"$current_version\"|<PackageVersion Include=\"$package_name\" Version=\"$latest_version\"|; s|<GlobalPackageReference Include=\"$package_name\" Version=\"$current_version\"|<GlobalPackageReference Include=\"$package_name\" Version=\"$latest_version\"|g" "$props_file";;
      [Nn]* )
          ;;
      * )
          echo "Please answer y or n.";;
  esac
done

```


Example:


```
&#x276F; update-nuget-packages
Update Nerdbank.GitVersioning from 3.6.133 to 3.6.143? (y/n): y
Update Npgsql.EntityFrameworkCore.PostgreSQL from 8.0.4 to 8.0.8? (y/n): y
Update Serilog.Formatting.Compact from 2.0.0 to 3.0.0? (y/n): y
Update Serilog.Sinks.Console from 5.0.1 to 6.0.0? (y/n): y
Update xunit from 2.9.0 to 2.9.2? (y/n): y

```


The "only" thing it does is go through your NuGet packages using the `dotnet list package --outdated` command. If it finds any updated versions, it asks if you want to update the package.


If you answer "yes," the **Directory.Packages.props** file will be updated with the new version.

<h2 id="scan-for-vulnerabilities">Scan for vulnerabilities


Dependency Day helps us stay up to date, but we only do it weekly or bi-weekly, depending on the workload. Now, imagine a package we're using contains a critical security vulnerability&#x2014;surely we don't want to wait until the next Dependency Day to resolve it, right? What if we don't even know we have a vulnerable package?


To address this, we scan for vulnerable packages every time we build our projects.


It's as simple as adding this step to your pipeline:


```
dotnet list package --vulnerable --include-transitive

```


I borrowed an image from the [Microsoft Devblog](https://devblogs.microsoft.com/nuget/how-to-scan-nuget-packages-for-security-vulnerabilities?WT.mc_id=DT-MVP-5004074) to show you an example of the output.<br>
<img src="https://josef.codes/content/images/2024/10/microsoft-show-vulnerable-packages.png" alt="microsoft-show-vulnerable-packages.png" loading="lazy">


If any vulnerable package is found when running our pipeline, we fail the build.

<h3 id="dotnet-nuget-why">dotnet nuget why


Sometimes it can be tricky to identify which package has a vulnerable dependency, especially if it's a transitive dependency.


Starting with .NET 8, you can use the `dotnet nuget why` command, which returns a dependency graph for the package.


For example, if you want to know why on earth you all of a sudden have a dependency on Azure.Identity, this command can help.


```
dotnet nuget why JOS.Enumeration.sln Azure.Identity
Project 'JOS.Enumeration.Migrator' has the following dependency graph(s) for 'Azure.Identity':
  [net8.0]
   &#x2502;
   &#x2514;&#x2500; JOS.Enumeration.Database.Tests (v1.0.0)
      &#x2514;&#x2500; Microsoft.Data.SqlClient (v4.0.5)
         &#x2514;&#x2500; Azure.Identity (v1.3.0)

```


*[Insert obligatory WHY does Microsoft.Data.SqlClient have a dependency on Azure.Identity rant here](https://github.com/dotnet/SqlClient/issues/2568)*