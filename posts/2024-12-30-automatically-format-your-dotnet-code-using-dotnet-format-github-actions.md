---
title: "Automatically format your dotnet code using dotnet format - GitHub Actions"
slug: automatically-format-your-dotnet-code-using-dotnet-format-github-actions
date: 2024-12-30T13:49:30.000Z
description: "Use dotnet format in your GitHub Actions pipelines to automatically format your code and avoid noise in pull requests"
tags: ["dotnet","github actions","dotnet core"]
---

<h2 id="background">Background


When working in a team, it's important to follow the style guidelines that apply to the project.


It makes it easier to read the code if all code "look and feel" the same. It should not be possible to tell who wrote the code just by looking at it; the style should be the same for all developers.


Currently we're enforcing the style by commeting on the code in pull requests. Something like this...


```csharp
public string MyProperty  { get; init; }

```


...would most likely lead to a comment like this:

<blockquote>

You have two spaces between `MyProperty` and the opening brace

</blockquote>

One could argue that this is being overly picky, but that's how we currently enforce the style.


Now imagine that you have submitted a pull requests where you've changed 20+ files. And that you have made the same error in all of them, in multiple places.


It can quickly become tedious for the person reviewing the code. Should the person add a comment on every single occasion?


Also, it's not that fun being on the receiving end of all the 'Fix the formatting here' comments either. It also adds unnecessary noise for other people reviewing the code.


Ideally, the code should be formatted correctly before the pull request is even created. Both Rider and Visual Studio have good tooling for this, but still, it's easy to forget.


The dotnet cli has built-in tooling for solving this problem, let's explore **[dotnet format](https://learn.microsoft.com/en-us/dotnet/core/tools/dotnet-format?WT.mc_id=DT-MVP-5004074)**

<blockquote>

dotnet format is a code formatter that applies style preferences and static analysis recommendations to a project or solution. Preferences will be read from an .editorconfig file, if present, otherwise a default set of preferences will be used.

</blockquote>

It's possible to setup a git commit-hook to run the formatting automatically. But in this post, we will run the formatting in the actual build pipeline.

<h2 id="github-action">GitHub Action


I have the following pipeline setup for one of my own projects. This pipeline runs for all pull requests.


```
name: Verify

on:
  pull_request:
    branches: [ "main" ]
jobs:
  build:
    timeout-minutes: 10
    name: Build and Test
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:16
        env:
          POSTGRES_USER: jos
          POSTGRES_PASSWORD: any
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          # Maps tcp port 5432 on service container to the host
          - 5432:5432
    steps:
    - uses: actions/checkout@v4
      with:
        fetch-depth: 0
    - uses: dotnet/nbgv@master
      id: nbgv
    - name: Setup .NET
      uses: actions/setup-dotnet@v4
      with:
        dotnet-version: |
          8.0.x
          9.0.x
    - name: Test Version ${{ steps.nbgv.outputs.nugetpackageversion }}
      run: dotnet test -c Release
    - name: Pack JOS.Enumeration.sln ${{ steps.nbgv.outputs.nugetpackageversion }}
      run: dotnet pack JOS.Enumeration.sln -c Release -o ./nuget-packages --no-build
    - name: Store nuget packages as artifacts
      uses: actions/upload-artifact@v4
      with:
        name: nuget-packages
        path: "nuget-packages/"

```


As you can see, it runs `dotnet test`, `dotnet pack`, and then stores the packages as artifacts.

<h2 id="format-all-files">Format All Files


The `dotnet format` command supports a lot of [different format operations](https://learn.microsoft.com/en-us/dotnet/core/tools/dotnet-format?WT.mc_id=DT-MVP-5004074#subcommands). I'm only interested in the `whitespace` and `style` operations.


My first approch was to just add `dotnet format` to the pipeline. I added the following two steps just before the `dotnet test` step.


```
- name: Check formatting
  continue-on-error: true
  id: checkFormatting
  run: | 
    dotnet format whitespace --no-restore --verify-no-changes
    dotnet format style --no-restore --verify-no-changes
- name: Fix formatting
  if: steps.checkFormatting.outcome == 'failure'
  run: |
    git config user.name "jos-yoda" &&
    git config user.email "144553819+jos-yoda@users.noreply.github.com" &&
    dotnet format --no-restore && 
    git commit -am "Fixes formatting - ${{steps.nbgv.outputs.nugetpackageversion}}" &&
    git push origin HEAD:${{github.event.pull_request.head.ref}}
  env:
    GITHUB_TOKEN: ${{ secrets.JOS_YODA_PAT }}

```


The first step runs `dotnet format` with the `--verify-no-changes` argument. It will return 0 if no changes are needed. If changes are needed, it will exit with a non-zero exit code.


I've also set `continue-on-error` to `true` since a non-zero exit code is expected.


The second step only runs if the previous step did not run successfully, meaning that dotnet format indicates changes need to be made.


If changes are needed, `dotnet format` runs and I then commit the changes to the branch. 'm using a bot account for the formatting commit, which is why I needed to do some git setup before pushing.


It worked perfectly fine. However, it looks at all code in the solution. It would be better to just focus on the files in the pull request.

<h2 id="format-only-changed-files">Format only changed files


It's possible to pass a space-delimited string of files to `dotnet format` using the `--include argument`.


By comparing the changes in the pull request against `main` (the target branch), I can get a list of files that's been changed like this:


```
git diff --name-only HEAD origin/main | tr '\n' ' '

```


I'm also replacing new lines with spaces so that I can pass the output to the `--include` argument.


```
- name: Check formatting
  continue-on-error: true
  id: checkFormatting
  run: | 
    dotnet format whitespace --no-restore --verify-no-changes --include $(git diff --name-only HEAD origin/main | tr '\n' ' ')
    dotnet format style --no-restore --verify-no-changes --include $(git diff --name-only HEAD origin/main | tr '\n' ' ')
- name: Fix formatting
  continue-on-error: true
  if: steps.checkFormatting.outcome == 'failure'
  run: |
    dotnet format whitespace --no-restore --include $(git diff --name-only HEAD origin/main | tr '\n' ' ')
    dotnet format style --no-restore --include $(git diff --name-only HEAD origin/main | tr '\n' ' ')

```


To get the comparison working against `main`, I also needed to add a step that explicitly fetches the `main` branch, since the GitHub Action only checks out the feature branch in a detached state.

<h2 id="example">Example


I made the following commit in a feature branch, where I changed the order of the usings and added unnecessary whitespace:


```
--- a/test/JOS.Enumeration.Tests/ClassGenerationTests.cs
+++ b/test/JOS.Enumeration.Tests/ClassGenerationTests.cs
@@ -1,5 +1,5 @@
-using Shouldly;
 using Xunit;
+using Shouldly;

 namespace JOS.Enumeration.Tests;

diff --git a/test/JOS.Enumerations/Drink.cs b/test/JOS.Enumerations/Drink.cs
index cd585a6..855fd98 100644
--- a/test/JOS.Enumerations/Drink.cs
+++ b/test/JOS.Enumerations/Drink.cs
@@ -5,6 +5,6 @@ namespace JOS.Enumerations;

 public partial class Drink : IEnumeration<Drink>
 {
-    public static readonly Drink GinTonic = new(1, "Gin" + "Tonic");
+    public static readonly Drink GinTonic = new (1, "Gin" + "Tonic");
     public static readonly Drink RedBullVodka = new(2, nameof(RedBullVodka));
 }

```


That produced the following commit (basically reverting my changes):<br>
<img src="https://josef.codes/content/images/2024/12/Screenshot-2024-12-30-at-14.35.35.png" alt="Screenshot 2024-12-30 at 14.35.35.png" loading="lazy">


Only thing left to do before merge is squashing the commits - and the history will be clean as well :).

<h3 id="complete-github-actions-file">Complete github actions file


The most up to date file [can be found at GitHub](https://github.com/joseftw/jos.enumeration/blob/main/.github/workflows/verify.yml?WT.mc_id=DT-MVP-5004074)), here's a snapshot as well:


```
name: Verify

on:
  pull_request:
    branches: [ "main" ]
jobs:
  build:
    timeout-minutes: 10
    name: Build and Test
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:16
        env:
          POSTGRES_USER: jos
          POSTGRES_PASSWORD: any
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          # Maps tcp port 5432 on service container to the host
          - 5432:5432
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0
      - name: Fetch main
        run: |
          git fetch origin main &&
          git checkout -b main origin/main
          git checkout -
      - uses: dotnet/nbgv@master
        id: nbgv
      - name: Setup .NET
        uses: actions/setup-dotnet@v4
        with:
          dotnet-version: |
            8.0.x
            9.0.x
      - name: Build Version ${{ steps.nbgv.outputs.nugetpackageversion }}
        run: dotnet build -c Release
      - name: Check formatting
        continue-on-error: true
        id: checkFormatting
        run: | 
          dotnet format whitespace --no-restore --verify-no-changes --include $(git diff --name-only HEAD origin/main | tr '\n' ' ')
          dotnet format style --no-restore --verify-no-changes --include $(git diff --name-only HEAD origin/main | tr '\n' ' ')
      - name: Fix formatting
        continue-on-error: true
        if: steps.checkFormatting.outcome == 'failure'
        run: |
          dotnet format whitespace --no-restore --include $(git diff --name-only HEAD origin/main | tr '\n' ' ')
          dotnet format style --no-restore --include $(git diff --name-only HEAD origin/main | tr '\n' ' ')
      - name: Test Version ${{ steps.nbgv.outputs.nugetpackageversion }}
        run: dotnet test -c Release --no-build --no-restore
      - name: Push formatting fixes
        if: steps.checkFormatting.outcome == 'failure'
        run: |
          git config user.name "jos-yoda" &&
          git config user.email "144553819+jos-yoda@users.noreply.github.com" &&
          git commit -am "Fixes formatting - ${{steps.nbgv.outputs.nugetpackageversion}}" &&
          git push origin HEAD:${{github.event.pull_request.head.ref}}
        env:
          GITHUB_TOKEN: ${{ secrets.JOS_YODA_PAT }}
      - name: Pack JOS.Enumeration.sln ${{ steps.nbgv.outputs.nugetpackageversion }}
        run: dotnet pack JOS.Enumeration.sln -c Release -o ./nuget-packages --no-build
      - name: Store nuget packages as artifacts
        uses: actions/upload-artifact@v4
        with:
          name: nuget-packages
          path: "nuget-packages/"


```