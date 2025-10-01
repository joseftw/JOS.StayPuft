# Conversion Summary

This repository has been successfully converted from a Ghost CMS theme to a **static site generator** that reads markdown files and generates HTML pages.

## What Changed

### Before
- Ghost CMS theme using Handlebars templates (`.hbs` files)
- Required Ghost CMS to be installed and running
- Content stored in Ghost database
- Dynamic server-side rendering

### After
- Static site generator using Node.js
- Markdown files for content (in `posts/` directory)
- Pure HTML/CSS/JS output (in `dist/` directory)
- Can be deployed anywhere (GitHub Pages, Netlify, Vercel, S3, etc.)
- No database or server required

## What Was Preserved

✅ **Exact same visual design** - all CSS and styling maintained  
✅ **Responsive layout** - sidebar on desktop (1280px+), header/footer on mobile  
✅ **Syntax highlighting** - Prism.js for code blocks  
✅ **Custom fonts** - josefottossonse font included  
✅ **Font Awesome icons** - custom subset maintained  
✅ **RSS feed** - generated automatically at `/rss.xml`  
✅ **All existing assets** - CSS, JS, fonts, etc.

## New Features

🎉 **Markdown-based content** - write posts in markdown with frontmatter  
🎉 **Static site generation** - fast, secure, and easy to deploy  
🎉 **RSS import** - can fetch existing posts from Ghost RSS feed  
🎉 **Simple workflow** - edit markdown, run `npm run generate`, deploy  
🎉 **No dependencies at runtime** - pure HTML/CSS/JS output

## How It Works

1. **Write posts** in markdown format in the `posts/` directory
2. **Run `npm run generate`** to build the site
3. **Deploy** the `dist/` folder to any static hosting

## Quick Start

```bash
# Install dependencies
npm install

# Optional: Fetch existing posts from Ghost RSS
npm run fetch-posts

# Generate the static site
npm run generate

# Preview locally
cd dist
python3 -m http.server 8000
```

## File Structure

```
.
├── posts/                    # Your markdown posts (NEW)
│   ├── 2025-09-12-post-1.md
│   └── 2024-12-30-post-2.md
├── generate.js               # Static site generator (NEW)
├── fetch-posts.js            # RSS importer (NEW)
├── dist/                     # Generated site (NEW)
│   ├── index.html
│   ├── post-slug/index.html
│   ├── assets/
│   └── rss.xml
├── assets/                   # Source assets (EXISTING)
│   ├── css/
│   ├── js/
│   └── built/               # Built CSS/JS
├── *.hbs                    # Original Ghost templates (KEPT for reference)
└── package.json             # Updated with new scripts
```

## Key Files

- **`generate.js`** - Main static site generator script
- **`fetch-posts.js`** - Fetches posts from RSS feed and converts to markdown
- **`STATIC-SITE.md`** - Complete documentation for the static site
- **`DEPLOYMENT.md`** - Deployment guides for various platforms
- **`posts/EXAMPLE.md`** - Example post showing markdown format

## Migration from Ghost

If you have an existing Ghost blog:

1. Run `npm run fetch-posts` to import all posts from RSS
2. Review and edit the generated markdown files in `posts/`
3. Update site configuration in `generate.js`
4. Generate and deploy

## Customization

### Site Configuration

Edit `generate.js`:

```javascript
const siteConfig = {
  title: 'Your Site Title',
  description: 'Your description',
  url: 'https://yoursite.com',
  locale: 'en',
  cover_image: 'https://yoursite.com/cover.jpg'
};
```

### Styling

Edit CSS files in `assets/css/` and rebuild:

```bash
npm run build
npm run generate
```

## Deployment

The site can be deployed to:

- **GitHub Pages** - free, easy, version controlled
- **Netlify** - automatic builds, free SSL
- **Vercel** - edge network, automatic HTTPS
- **AWS S3 + CloudFront** - scalable, global CDN
- **Any web server** - just upload the `dist/` folder

See `DEPLOYMENT.md` for detailed instructions.

## Benefits of Static Site

1. **Performance** - Static HTML is extremely fast
2. **Security** - No server-side code, no database to hack
3. **Scalability** - Can handle millions of requests
4. **Reliability** - No moving parts to break
5. **Cost** - Free hosting on GitHub Pages, Netlify, etc.
6. **Simplicity** - Just HTML/CSS/JS files
7. **Version Control** - All content in Git
8. **Portability** - Works anywhere

## Testing

The static site has been tested and verified:

✅ Desktop layout (1920x1080) - sidebar displays correctly  
✅ Mobile layout (375x667) - responsive stacking works  
✅ Navigation - all links work correctly  
✅ Post pages - individual posts render properly  
✅ Code syntax highlighting - Prism.js working  
✅ RSS feed - generates correctly  
✅ Reading time - calculated automatically  
✅ Date formatting - "time ago" and full dates  

## Original Ghost Theme

The original Ghost theme templates (`.hbs` files) are still in the repository for reference, but they are no longer used. The static site generator creates HTML directly in JavaScript while maintaining the exact same structure and styling.

## Support

For issues or questions:

1. Check `STATIC-SITE.md` for usage documentation
2. Check `DEPLOYMENT.md` for deployment help
3. Review the example post in `posts/EXAMPLE.md`
4. Check the GitHub issues for this repository

## Credits

- Original theme: Fork of [dlecina/StayPuft](https://github.com/dlecina/StayPuft)
- Converted to static site generator: 2025
- Maintains all original design and features from [josef.codes](https://josef.codes)
