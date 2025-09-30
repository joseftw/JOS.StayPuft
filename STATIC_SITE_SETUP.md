# Static Site Generation Setup Guide

This guide explains how to use JOS.StayPuft as a static site generator with Ghost as the CMS backend.

## Overview

The static site generation workflow allows you to:
- Keep using Ghost for content management (admin UI, CMS features)
- Generate a completely static website from Ghost content
- Deploy to any static hosting (Netlify, Vercel, GitHub Pages, etc.)
- Benefit from improved performance, security, and lower hosting costs

## Architecture

```
Ghost CMS (Backend)
       ↓ (Ghost Content API)
Fetch Content Script
       ↓
Local JSON Data Files
       ↓
Eleventy Static Site Generator
       ↓
Static HTML Files
       ↓
Deploy to Static Hosting
```

## Prerequisites

1. **Ghost Instance**: You need a running Ghost instance (self-hosted or Ghost(Pro))
2. **Ghost Content API Key**: Get this from Ghost Admin → Integrations → Add custom integration
3. **Node.js 18+**: Required for the build process

## Installation

### Step 1: Install Additional Dependencies

```bash
npm install --save-dev @11ty/eleventy @11ty/eleventy-plugin-handlebars @tryghost/content-api moment handlebars
```

### Step 2: Configure Environment Variables

Create a `.env` file in the root directory:

```env
# Your Ghost instance URL
GHOST_API_URL=https://your-ghost-site.com

# Your Ghost Content API Key (from Ghost Admin → Integrations)
GHOST_CONTENT_API_KEY=your_api_key_here
```

**Important**: Add `.env` to `.gitignore` to keep your API key secure:

```bash
echo ".env" >> .gitignore
```

### Step 3: Update package.json Scripts

The following scripts are available (add them to `package.json` if not present):

```json
{
  "scripts": {
    "dev": "node build.js --watch",
    "build": "node build.js",
    "static:fetch": "node scripts/fetch-ghost-content.js",
    "static:build": "node scripts/static-build.js",
    "static:serve": "node scripts/static-build.js --serve",
    "static:deploy": "node scripts/static-build.js"
  }
}
```

## Usage

### Development Workflow

#### 1. Fetch Content from Ghost

```bash
npm run static:fetch
```

This fetches all content from your Ghost instance and saves it to `_data/` directory.

#### 2. Build Static Site

```bash
npm run static:build
```

This builds the complete static site and outputs to `_site/` directory.

#### 3. Preview Locally

```bash
npm run static:serve
```

This builds and serves the site locally at `http://localhost:8080` with live reload.

### Production Workflow

For production deployment, run:

```bash
npm run static:deploy
```

This performs a complete build (fetch + build + generate) suitable for deployment.

## Directory Structure

```
JOS.StayPuft/
├── _data/                    # Ghost content data (JSON)
│   ├── posts.json           # All posts
│   ├── pages.json           # All pages
│   ├── tags.json            # All tags
│   ├── authors.json         # All authors
│   ├── settings.json        # Site settings
│   └── site.js              # Site data transformer
├── _site/                    # Generated static site (output)
├── scripts/
│   ├── fetch-ghost-content.js  # Ghost API fetcher
│   └── static-build.js         # Build orchestrator
├── .eleventy.js             # Eleventy configuration
├── partials/                # Handlebars partials
├── *.hbs                    # Handlebars templates
└── assets/                  # Theme assets (CSS, JS)
```

## Configuration

### Eleventy Configuration

Edit `.eleventy.js` to customize:

- Template formats
- Passthrough file copying
- Custom filters and helpers
- Collections and pagination

Example customization:

```javascript
// .eleventy.js
module.exports = function(eleventyConfig) {
  // Add custom filter
  eleventyConfig.addFilter("excerpt", function(content, length = 200) {
    return content.substring(0, length) + '...';
  });
  
  // Add custom collection
  eleventyConfig.addCollection("featured", function(collectionApi) {
    const posts = require('./_data/posts.json');
    return posts.filter(post => post.featured);
  });
  
  return {
    dir: {
      input: ".",
      output: "_site"
    }
  };
};
```

### Ghost Content API Options

Edit `scripts/fetch-ghost-content.js` to customize what content is fetched:

```javascript
// Fetch only published posts
const posts = await api.posts.browse({
  limit: 'all',
  filter: 'status:published',
  include: 'tags,authors',
  formats: ['html', 'plaintext']
});

// Fetch specific tags
const tags = await api.tags.browse({
  limit: 'all',
  filter: 'visibility:public'
});
```

## Deployment

### Netlify

1. Connect your GitHub repository to Netlify
2. Configure build settings:
   - **Build command**: `npm run static:deploy`
   - **Publish directory**: `_site`
3. Add environment variables in Netlify dashboard:
   - `GHOST_API_URL`
   - `GHOST_CONTENT_API_KEY`

### Vercel

1. Connect your GitHub repository to Vercel
2. Configure build settings:
   - **Build command**: `npm run static:deploy`
   - **Output directory**: `_site`
3. Add environment variables in Vercel dashboard

### GitHub Pages

1. Add GitHub Actions workflow (`.github/workflows/deploy.yml`):

```yaml
name: Deploy Static Site

on:
  push:
    branches: [main]
  workflow_dispatch:

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Build static site
        run: npm run static:deploy
        env:
          GHOST_API_URL: ${{ secrets.GHOST_API_URL }}
          GHOST_CONTENT_API_KEY: ${{ secrets.GHOST_CONTENT_API_KEY }}
          
      - name: Deploy to GitHub Pages
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./_site
```

2. Add secrets in GitHub repository settings:
   - `GHOST_API_URL`
   - `GHOST_CONTENT_API_KEY`

### Manual Deployment

Build locally and upload to any web server:

```bash
npm run static:deploy
# Upload _site/ directory to your web server
```

## Automated Rebuilds

To automatically rebuild when content changes in Ghost, set up a webhook:

### Using Netlify/Vercel Webhooks

1. In Ghost Admin → Integrations → Webhooks
2. Create a new webhook for "Site changed" event
3. Use Netlify/Vercel build hook URL
4. Site rebuilds automatically when content is updated

### Using GitHub Actions + Ghost Webhooks

1. Create a build trigger webhook in GitHub Actions
2. Configure Ghost webhook to call it
3. Site rebuilds and redeploys automatically

## Performance Considerations

### Build Time

- **Small sites** (< 100 posts): ~30 seconds
- **Medium sites** (100-500 posts): 1-3 minutes
- **Large sites** (500+ posts): 3-10 minutes

### Optimization Tips

1. **Incremental builds**: Only fetch changed content
2. **Image optimization**: Use Ghost's built-in image optimization
3. **Caching**: Cache `_data/` directory between builds if content hasn't changed
4. **Parallel fetching**: Fetch different content types in parallel (already implemented)

## Troubleshooting

### "Content API key not found"

Make sure `.env` file exists with correct `GHOST_CONTENT_API_KEY`.

### "Posts not rendering"

1. Check `_data/posts.json` exists and contains data
2. Verify Ghost API is accessible: `curl $GHOST_API_URL/ghost/api/v5.0/content/posts/?key=$GHOST_CONTENT_API_KEY`

### "Template errors"

Some Ghost helpers may not work exactly the same in Eleventy. Check `.eleventy.js` for custom helper implementations.

### "Assets not loading"

Ensure `npm run build` was run before `eleventy` to generate CSS/JS bundles.

## Comparison: Dynamic vs Static

### Dynamic Ghost Theme (Current)

**Pros:**
- Instant content updates
- Dynamic features (search, real-time comments)
- No build step

**Cons:**
- Requires Ghost hosting
- Higher resource usage
- Potential performance issues with traffic spikes

### Static Site Generation (New)

**Pros:**
- Much faster page loads
- Lower hosting costs (can use free tiers)
- Better security (no database, no dynamic server)
- Scales infinitely with CDN
- Can host anywhere

**Cons:**
- Content updates not immediate (requires rebuild)
- No dynamic features without client-side solutions
- Build step required

## Migration Checklist

- [ ] Install dependencies (`@11ty/eleventy`, `@tryghost/content-api`, etc.)
- [ ] Configure `.env` with Ghost API credentials
- [ ] Test content fetching: `npm run static:fetch`
- [ ] Test local build: `npm run static:build`
- [ ] Preview locally: `npm run static:serve`
- [ ] Configure deployment platform (Netlify/Vercel/GitHub Pages)
- [ ] Set up environment variables in deployment platform
- [ ] Test deployment
- [ ] Configure Ghost webhooks for automatic rebuilds
- [ ] Update DNS to point to new static hosting (if applicable)

## Future Enhancements

Potential improvements for the static site generation:

1. **Incremental builds**: Only rebuild changed content
2. **Image optimization**: Automatic image resizing and format conversion
3. **Search**: Client-side search with Algolia or Pagefind
4. **RSS feed generation**: Generate RSS/Atom feeds from posts
5. **Sitemap generation**: Automatic sitemap.xml creation
6. **AMP support**: Generate AMP versions of posts
7. **Internationalization**: Multi-language support

## Support

For issues or questions:
1. Check [STATIC_SITE_INVESTIGATION.md](./STATIC_SITE_INVESTIGATION.md) for detailed analysis
2. Review Eleventy documentation: https://www.11ty.dev/
3. Check Ghost API documentation: https://ghost.org/docs/content-api/
4. Open an issue on GitHub

## License

Same as JOS.StayPuft theme (MIT License)
