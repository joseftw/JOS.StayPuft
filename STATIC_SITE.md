# Static Site Generation

This Ghost theme has been converted to work as a static site generator using Eleventy.

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Add Your Content

Place your markdown files in the `posts/` directory. Each post should have frontmatter like this:

```markdown
---
layout: post.njk
title: Your Post Title
slug: your-post-slug
date: 2024-01-15
tags:
  - Technology
  - Web Development
author: Your Name
excerpt: A brief description of your post
featured: false
feature_image: https://example.com/image.jpg
---

Your content here...
```

### 3. Build the Site

```bash
# Build assets (CSS/JS)
npm run build

# Generate static site
npx eleventy

# Or serve with live reload
npx eleventy --serve
```

The static site will be generated in the `_site/` directory.

## Features

✅ **Individual post pages** - Each markdown file generates a page at `/slug/`
✅ **Homepage** - Lists all posts at `/`
✅ **Tag pages** - Automatic pages for each tag at `/tag/tag-name/`
✅ **Author pages** - Automatic pages for each author at `/author/author-name/`
✅ **Theme styling** - Uses the original Ghost theme CSS

## Frontmatter Fields

- `layout` - **Required**. Should be `post.njk`
- `title` - **Required**. Post title
- `slug` - **Required**. URL-friendly post identifier
- `date` - **Required**. Post date (YYYY-MM-DD format)
- `author` - **Required**. Author name
- `tags` - Optional. Array of tags
- `excerpt` - Optional. Short description
- `featured` - Optional. Boolean to mark as featured
- `feature_image` - Optional. URL to featured image

## Project Structure

```
posts/                  # Your markdown files
_layouts/
  ├── base.njk         # Base layout with header/footer
  └── post.njk         # Post layout
index.njk              # Homepage template
tags.njk               # Tag pages template
authors.njk            # Author pages template
assets/built/          # Generated CSS/JS (from npm run build)
_site/                 # Generated static site
```

## Deployment

Deploy the `_site/` directory to any static hosting:

- **Netlify**: Connect repository, build command: `npm run build && npx eleventy`, publish dir: `_site`
- **Vercel**: Same as Netlify
- **GitHub Pages**: Copy `_site/` contents to gh-pages branch
- **Any CDN**: Upload `_site/` contents

## Development

```bash
# Watch mode with live reload
npx eleventy --serve

# Build for production
npm run build && npx eleventy
```

## Customization

- Edit `_layouts/base.njk` to change the site structure
- Edit `_layouts/post.njk` to change post layout
- Edit `index.njk` to change homepage
- Modify `.eleventy.js` to add custom filters or collections
