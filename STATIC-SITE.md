# Static Site Generator

This theme has been converted to a static site generator that reads markdown files from the `posts/` directory and generates a complete static website.

## How It Works

1. **Posts**: Markdown files in the `posts/` directory with frontmatter metadata
2. **Generator**: Node.js script (`generate.js`) that reads posts and generates HTML
3. **Assets**: CSS and JS are built from the `assets/` directory using the existing build system
4. **Output**: Complete static site in the `dist/` directory

## Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Build Assets

```bash
npm run build
```

This builds the CSS and JavaScript files from the `assets/` directory.

### 3. Fetch Posts (Optional)

You can fetch existing posts from the RSS feed:

```bash
npm run fetch-posts
```

This will download posts from `https://josef.codes/rss/` and convert them to markdown files in the `posts/` directory.

### 4. Generate Static Site

```bash
npm run generate
```

This will:
- Build the CSS and JS assets
- Read all markdown files from `posts/`
- Generate HTML pages in `dist/`
- Generate tag pages for each unique tag (e.g., `/tag/dotnet/`)
- Generate author page at `/author/josef-ottosson/`
- Create an RSS feed at `dist/rss.xml`

### 5. Preview Locally

```bash
cd dist
python3 -m http.server 8000
```

Then open http://localhost:8000 in your browser.

## Post Format

Posts should be markdown files with YAML frontmatter:

```markdown
---
title: "Your Post Title"
slug: your-post-slug
date: 2025-01-15T10:00:00.000Z
description: "A brief description of your post"
tags: ["tag1", "tag2", "tag3"]
feature_image: https://example.com/image.jpg (optional)
featured: false (optional)
---

Your post content in markdown format...

## Headings work

- Lists work
- Code blocks work

\`\`\`javascript
console.log('Syntax highlighting works!');
\`\`\`
```

## Directory Structure

```
.
├── posts/                    # Markdown files for blog posts
├── assets/                   # CSS, JS, fonts, images
│   ├── css/                  # Source CSS files
│   ├── js/                   # Source JS files
│   └── built/                # Built/minified assets (generated)
├── dist/                     # Generated static site (generated)
│   ├── index.html            # Home page
│   ├── post-slug/            # Individual post pages
│   ├── tag/                  # Tag archive pages
│   │   ├── dotnet/
│   │   ├── asp.net-core/
│   │   └── ...
│   ├── author/               # Author pages
│   │   └── josef-ottosson/
│   └── rss.xml              # RSS feed
├── generate.js               # Static site generator script
├── fetch-posts.js            # Script to fetch posts from RSS
└── package.json              # Dependencies and scripts
```

## Generated Pages

The generator creates the following pages:

- **Home page** (`/`) - Lists all posts in reverse chronological order
- **Individual post pages** (`/post-slug/`) - Full content for each post
- **Tag pages** (`/tag/tag-name/`) - Lists all posts with a specific tag
- **Author page** (`/author/author-name/`) - Lists all posts by the author
- **RSS feed** (`/rss.xml`) - Full RSS feed with all posts

## Design Preservation

The static site maintains the exact design from the original Ghost theme:

- **Desktop**: Fixed sidebar on the left with site header and footer
- **Mobile**: Header at top, footer at bottom, no sidebar
- **Responsive breakpoint**: 1280px for sidebar layout
- All CSS and JavaScript from the original theme is preserved
- Syntax highlighting with Prism.js
- Font Awesome icons
- Custom font (josefottossonse)

## Deployment

The `dist/` directory contains a complete static site that can be deployed to:

- GitHub Pages
- Netlify
- Vercel
- AWS S3 + CloudFront
- Any static hosting service

## Customization

### Site Configuration

Edit the `siteConfig` object in `generate.js`:

```javascript
const siteConfig = {
  title: 'Josef Ottosson',
  description: 'Freelancing Developer · Microsoft MVP',
  url: 'https://josef.codes',
  locale: 'en',
  cover_image: 'https://josef.codes/content/images/2017/05/header.jpg'
};
```

### Styling

Modify CSS files in `assets/css/` and rebuild:

```bash
npm run build
npm run generate
```

## Original Ghost Theme

This static site generator is based on the JOS.StayPuft Ghost theme. The original Handlebars templates (`.hbs` files) are still present but are no longer used. The generator creates HTML directly in JavaScript while preserving the exact same markup structure and styling.
