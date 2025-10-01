---
title: "Example Post - How to Write Posts"
slug: example-post
date: 2025-01-01T00:00:00.000Z
description: "An example post demonstrating markdown features and how to write new posts"
tags: ["example", "documentation"]
---

# Example Post

This is an example post to demonstrate how to write new blog posts in markdown format.

## How to Create a New Post

Simply create a new markdown file in the `posts/` directory with the following frontmatter:

```markdown
---
title: "Your Post Title"
slug: your-post-slug
date: 2025-01-15T10:00:00.000Z
description: "A brief description"
tags: ["tag1", "tag2"]
---

Your content here...
```

## Markdown Features

You can use all standard markdown features:

### Code Blocks

```javascript
function hello() {
  console.log('Hello, world!');
}
```

### Lists

- Item 1
- Item 2
- Item 3

### Links and Images

[Link text](https://example.com)

### Emphasis

**Bold text** and *italic text*.

## Publishing

After creating your markdown file:

1. Run `npm run build` to build CSS/JS assets
2. Run `npm run generate` to generate the static site
3. Deploy the `dist/` folder to your hosting service

That's it! Your post will appear on the homepage and have its own page at `/your-post-slug/`.
