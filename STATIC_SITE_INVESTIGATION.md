# Static Site Generation Investigation for JOS.StayPuft

## Executive Summary

This document investigates the feasibility of converting the JOS.StayPuft Ghost theme into a static site generator workflow while maintaining Ghost as the CMS backend.

## Current Architecture

### Theme Structure
- **Ghost Theme**: Handlebars templates (`.hbs` files)
- **Build System**: Custom Node.js build script using Rollup and PostCSS
- **Assets**: CSS processed with PostCSS, JS bundled with Rollup
- **Content Source**: Ghost CMS (dynamic rendering)

### Key Files
- `default.hbs`: Main layout template
- `post.hbs`: Single post template
- `tag.hbs`: Tag archive template
- `index.hbs`: Homepage template
- `author.hbs`: Author archive template
- `build.js`: Asset build script

## Static Site Generator Options

### 1. Eleventy (11ty) - **RECOMMENDED**

**Pros:**
- ✅ Native support for multiple template languages including Handlebars
- ✅ Zero-config approach with flexible customization
- ✅ Excellent performance (pre-built static files)
- ✅ Strong Ghost integration community
- ✅ Can reuse existing `.hbs` templates with minimal modifications
- ✅ Active maintenance (last release: 2024)
- ✅ JavaScript-based (matches current tech stack)
- ✅ Built-in pagination, collections, and data fetching

**Cons:**
- ⚠️ Requires data transformation from Ghost API to 11ty data structure
- ⚠️ Learning curve for configuration

**Ghost Integration:**
- Use `@tryghost/content-api` npm package
- Fetch data during build time
- Generate static HTML files

**Popularity:**
- 17k+ GitHub stars
- Used by Google, MIT, and other major organizations
- Active community and plugins

### 2. Gatsby

**Pros:**
- ✅ Official `gatsby-source-ghost` plugin
- ✅ React-based with modern features (SSG, SSR, incremental builds)
- ✅ GraphQL data layer
- ✅ Strong plugin ecosystem
- ✅ Image optimization built-in
- ✅ Excellent documentation

**Cons:**
- ❌ Requires complete template rewrite (React JSX vs Handlebars)
- ❌ Heavier build times for large sites
- ❌ Steeper learning curve
- ❌ More complex setup

**Popularity:**
- 55k+ GitHub stars
- Large community
- Enterprise-ready

### 3. Hugo

**Pros:**
- ✅ Extremely fast build times (written in Go)
- ✅ No runtime dependencies
- ✅ Built-in taxonomies (tags, categories)
- ✅ Powerful templating (Go templates)

**Cons:**
- ❌ Complete template rewrite required (Go templates vs Handlebars)
- ❌ Different syntax and approach
- ❌ Less natural Ghost integration
- ❌ Requires Go installation for development

**Popularity:**
- 75k+ GitHub stars
- Very active maintenance

### 4. Next.js (Static Export)

**Pros:**
- ✅ Modern React framework with SSG support
- ✅ Incremental Static Regeneration (ISR)
- ✅ Great developer experience
- ✅ API routes for additional functionality

**Cons:**
- ❌ Complete rewrite to React
- ❌ More complex than pure SSG
- ❌ Requires more infrastructure knowledge

**Popularity:**
- 125k+ GitHub stars
- Industry standard for React SSG/SSR

### 5. Astro

**Pros:**
- ✅ Component-agnostic (can use React, Vue, Svelte, etc.)
- ✅ Excellent performance (ships zero JS by default)
- ✅ Modern developer experience
- ✅ Built-in integrations

**Cons:**
- ❌ Template rewrite required
- ❌ Newer framework (less mature)
- ❌ Smaller community

**Popularity:**
- 45k+ GitHub stars
- Rapidly growing

## Comparison Matrix

| Feature | Eleventy | Gatsby | Hugo | Next.js | Astro |
|---------|----------|--------|------|---------|-------|
| Template Reuse | ✅ High | ❌ None | ❌ None | ❌ None | ❌ None |
| Build Speed | ⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ |
| Ghost API Support | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| Learning Curve | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ |
| Maintenance | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| Community Size | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |

## Recommendation: Eleventy (11ty)

### Why Eleventy?

1. **Minimal Migration Effort**: Can reuse existing Handlebars templates with minimal changes
2. **JavaScript Ecosystem**: Matches current build tooling (Node.js, npm)
3. **Flexibility**: Can incrementally adopt without complete rewrite
4. **Performance**: Fast builds and static output
5. **Ghost API Integration**: Straightforward with `@tryghost/content-api`

### Implementation Approach

#### Phase 1: Setup & Configuration

```bash
# Install dependencies
npm install --save-dev @11ty/eleventy @tryghost/content-api
```

#### Phase 2: Data Fetching

Create a data file to fetch Ghost content:

```javascript
// _data/ghost.js
const GhostContentAPI = require('@tryghost/content-api');

const api = new GhostContentAPI({
  url: process.env.GHOST_API_URL,
  key: process.env.GHOST_CONTENT_API_KEY,
  version: 'v5.0'
});

module.exports = async function() {
  const posts = await api.posts.browse({
    limit: 'all',
    include: 'tags,authors'
  });
  
  const tags = await api.tags.browse({
    limit: 'all',
    include: 'count.posts'
  });
  
  const settings = await api.settings.browse();
  
  return {
    posts,
    tags,
    settings
  };
};
```

#### Phase 3: Template Adaptation

Eleventy can use existing `.hbs` files with minor modifications:

```javascript
// .eleventy.js
module.exports = function(eleventyConfig) {
  // Copy static assets
  eleventyConfig.addPassthroughCopy("assets");
  
  // Set Handlebars as template engine
  eleventyConfig.setLibrary("hbs", require("handlebars"));
  
  // Add custom filters to match Ghost helpers
  eleventyConfig.addFilter("date", function(date, format) {
    // Date formatting logic
  });
  
  return {
    dir: {
      input: ".",
      output: "_site",
      includes: "partials"
    },
    templateFormats: ["hbs", "md"],
    htmlTemplateEngine: "hbs"
  };
};
```

#### Phase 4: Build Pipeline Integration

```json
// package.json scripts
{
  "scripts": {
    "dev": "node build.js --watch",
    "build": "node build.js",
    "static:fetch": "node scripts/fetch-ghost-content.js",
    "static:build": "npm run build && eleventy",
    "static:serve": "eleventy --serve",
    "static:deploy": "npm run static:fetch && npm run static:build"
  }
}
```

#### Phase 5: URL Structure Preservation

Configure Eleventy to match Ghost URL structure:

```javascript
// .eleventy.js
eleventyConfig.addCollection("posts", function(collection) {
  return collection.getAll().filter(item => item.data.type === 'post');
});

// Permalink structure
permalink: "/{{ slug }}/"
```

## Alternative Approach: Gatsby (If React is Acceptable)

If willing to rewrite templates in React:

```bash
npm install --save gatsby gatsby-source-ghost
```

```javascript
// gatsby-config.js
module.exports = {
  plugins: [
    {
      resolve: `gatsby-source-ghost`,
      options: {
        apiUrl: process.env.GHOST_API_URL,
        contentApiKey: process.env.GHOST_CONTENT_API_KEY,
      },
    },
  ],
};
```

## Deployment Considerations

### Build Trigger Options

1. **Webhook-based**: Ghost webhook → CI/CD → Build → Deploy
2. **Scheduled**: Cron job to rebuild periodically
3. **Manual**: On-demand builds via npm script
4. **Hybrid**: Webhook for immediate updates + scheduled for reliability

### Hosting Options

- **Netlify**: Automatic builds from Git, CDN, free SSL
- **Vercel**: Similar to Netlify, excellent Next.js/React support
- **GitHub Pages**: Free hosting for static sites
- **Cloudflare Pages**: Fast global CDN, generous free tier
- **AWS S3 + CloudFront**: Traditional static hosting

## Proof of Concept Plan

### Step 1: Basic Setup (1-2 hours)
1. Install Eleventy
2. Configure basic `.eleventy.js`
3. Test template rendering with sample data

### Step 2: Ghost API Integration (2-3 hours)
1. Set up Ghost Content API client
2. Create data fetching scripts
3. Test data structure compatibility

### Step 3: Template Migration (3-4 hours)
1. Adapt `default.hbs` as base layout
2. Migrate `post.hbs` template
3. Create pagination for `index.hbs`
4. Adapt `tag.hbs` and `author.hbs`

### Step 4: Asset Pipeline (1-2 hours)
1. Integrate existing `build.js` with Eleventy
2. Ensure CSS/JS assets are processed correctly
3. Set up asset copying

### Step 5: Testing & Refinement (2-3 hours)
1. Test all routes and templates
2. Verify Ghost helper equivalents
3. Check mobile responsiveness
4. Validate SEO metadata

**Total Estimated Time**: 9-14 hours for complete POC

## Risks & Mitigation

### Risk 1: Ghost Helper Compatibility
**Impact**: Some Ghost-specific helpers may not work
**Mitigation**: Create custom Eleventy filters/shortcodes to replicate functionality

### Risk 2: Dynamic Features
**Impact**: Features like search, comments need alternative implementation
**Mitigation**: Use client-side solutions (Algolia, Giscus already used for comments)

### Risk 3: Build Time
**Impact**: Large sites may have slow build times
**Mitigation**: Implement incremental builds, caching strategies

### Risk 4: Content Updates Delay
**Impact**: Content changes not immediately visible
**Mitigation**: Implement webhook-triggered builds for near-instant updates

## Success Metrics

1. ✅ Build completes successfully with all content
2. ✅ All existing URL patterns preserved
3. ✅ Page load time < 2 seconds (static vs dynamic)
4. ✅ Build time < 5 minutes for full site
5. ✅ All Ghost content types supported (posts, pages, tags, authors)
6. ✅ SEO metadata preserved
7. ✅ Responsive design maintained

## Conclusion

**Recommendation**: Proceed with Eleventy (11ty) for the following reasons:

1. **Lowest Migration Effort**: Can reuse ~80% of existing Handlebars templates
2. **Familiar Stack**: JavaScript/Node.js based
3. **Active Maintenance**: Well-maintained with regular updates
4. **Proven Ghost Integration**: Multiple successful implementations in the wild
5. **Incremental Adoption**: Can start with POC and gradually expand

**Next Steps**:
1. Create POC with Eleventy + Ghost API
2. Test with subset of content (10-20 posts)
3. Validate build performance and output quality
4. Document any required template modifications
5. Create deployment pipeline
6. Full migration if POC successful

## Resources

- [Eleventy Documentation](https://www.11ty.dev/)
- [Ghost Content API](https://ghost.org/docs/content-api/)
- [@tryghost/content-api](https://www.npmjs.com/package/@tryghost/content-api)
- [Eleventy + Ghost Tutorial](https://www.11ty.dev/docs/data-js/)
- [Ghost to Eleventy Examples](https://github.com/topics/eleventy-ghost)

## Appendix: Example Projects

### Eleventy + Ghost
- [ghost-to-11ty](https://github.com/TryGhost/eleventy-starter-ghost) - Official Eleventy starter for Ghost
- Multiple production sites using this stack

### Gatsby + Ghost
- [gatsby-starter-ghost](https://github.com/TryGhost/gatsby-starter-ghost) - Official Gatsby starter
- Used by several high-traffic Ghost sites
