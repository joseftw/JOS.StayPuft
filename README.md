# JOS.StayPuft

Fork of [dlecina/StayPuft](https://github.com/dlecina/StayPuft).
I've removed the Search and all other stuff that used jQuery.

Works with ghost 3.0+

## Features

* Giscus comments
* Custom Fontawesome font (only contains icons that are being used by the theme).
* **NEW: Static Site Generation** - Generate static HTML from Ghost content

## Features coming soon:

* Lazy loading of images

## Static Site Generation

This theme now supports static site generation! You can use Ghost as your CMS backend and generate a completely static website for improved performance, security, and lower hosting costs.

📚 **Documentation:**
- [Investigation Report](./STATIC_SITE_INVESTIGATION.md) - Detailed research and comparison of static site generators
- [Setup Guide](./STATIC_SITE_SETUP.md) - Complete setup and deployment instructions
- [POC Demo](./STATIC_SITE_POC.md) - Quick start proof-of-concept guide

**Quick Start:**
```bash
# Install optional dependencies
npm install --save-dev @11ty/eleventy @11ty/eleventy-plugin-handlebars @tryghost/content-api handlebars moment

# Create sample data for testing
npm run static:sample

# Build and preview
npm run static:serve
```

See [STATIC_SITE_POC.md](./STATIC_SITE_POC.md) for detailed instructions.
