# Static Site Generation Workflow

## Content Publishing Workflow

```
┌─────────────────────────────────────────────────────────────┐
│  STEP 1: Create Content                                     │
├─────────────────────────────────────────────────────────────┤
│  Ghost Admin UI → Write/Edit Posts → Click Publish          │
│  ✓ Rich editor                                               │
│  ✓ Image upload                                              │
│  ✓ Tag management                                            │
│  ✓ SEO settings                                              │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  STEP 2: Trigger Build (Optional Webhook)                   │
├─────────────────────────────────────────────────────────────┤
│  Ghost Webhook → CI/CD Platform (GitHub Actions)            │
│  Automatic rebuild on content changes                        │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  STEP 3: Fetch Content via API                               │
├─────────────────────────────────────────────────────────────┤
│  npm run static:fetch                                        │
│  ↓                                                            │
│  Ghost Content API → JSON data files                         │
│  • posts.json                                                │
│  • pages.json                                                │
│  • tags.json                                                 │
│  • authors.json                                              │
│  • settings.json                                             │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  STEP 4: Build Assets                                        │
├─────────────────────────────────────────────────────────────┤
│  npm run build                                               │
│  ↓                                                            │
│  • Process CSS (PostCSS)                                     │
│  • Bundle JavaScript (Rollup)                                │
│  • Minify and optimize                                       │
│  • Generate source maps                                      │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  STEP 5: Generate Static HTML                                │
├─────────────────────────────────────────────────────────────┤
│  eleventy                                                    │
│  ↓                                                            │
│  • Load data from JSON files                                 │
│  • Render Handlebars templates                               │
│  • Generate all pages                                        │
│  • Copy assets                                               │
│  • Create clean URLs                                         │
│  ↓                                                            │
│  Output: _site/ directory with static HTML                   │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  STEP 6: Deploy to CDN                                       │
├─────────────────────────────────────────────────────────────┤
│  Deploy _site/ to:                                           │
│  • GitHub Pages (free)                                       │
│  • Netlify (free tier)                                       │
│  • Vercel (free tier)                                        │
│  • Cloudflare Pages (free)                                   │
│  • Your own CDN                                              │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  STEP 7: Serve to Users                                      │
├─────────────────────────────────────────────────────────────┤
│  User Request → CDN → Pre-rendered HTML                      │
│  ⚡ Instant response (< 100ms)                               │
│  🌍 Global CDN distribution                                  │
│  ♾️  Infinite scalability                                    │
└─────────────────────────────────────────────────────────────┘
```

## Development Workflow

### Local Development

```bash
# 1. Create sample data for testing
npm run static:sample

# 2. Build and serve with live reload
npm run static:serve

# 3. View at http://localhost:8080
# 4. Make changes to templates
# 5. Browser auto-reloads
```

### Working with Real Ghost Content

```bash
# 1. Configure .env with Ghost credentials
cp .env.example .env
# Edit .env with your Ghost API details

# 2. Fetch real content
npm run static:fetch

# 3. Build and serve
npm run static:serve
```

## Production Deployment

### Manual Deployment

```bash
# Full build for production
npm run static:deploy

# Upload _site/ to hosting
# e.g., rsync, FTP, cloud storage, etc.
```

### Automated Deployment (Recommended)

#### With GitHub Actions

```yaml
# .github/workflows/static-site-deploy.yml
name: Deploy
on: [push]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: npm ci
      - run: npm run static:deploy
        env:
          GHOST_API_URL: ${{ secrets.GHOST_API_URL }}
          GHOST_CONTENT_API_KEY: ${{ secrets.GHOST_CONTENT_API_KEY }}
      - uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./_site
```

#### With Netlify

1. Connect GitHub repository to Netlify
2. Build command: `npm run static:deploy`
3. Publish directory: `_site`
4. Environment variables: `GHOST_API_URL`, `GHOST_CONTENT_API_KEY`

#### With Vercel

1. Connect GitHub repository to Vercel
2. Build command: `npm run static:deploy`
3. Output directory: `_site`
4. Environment variables: `GHOST_API_URL`, `GHOST_CONTENT_API_KEY`

## Content Update Flow

### Without Webhooks (Manual)

```
1. Update content in Ghost Admin
2. Manually trigger build:
   - Run locally and deploy, OR
   - Trigger CI/CD pipeline manually, OR
   - Wait for scheduled rebuild (if configured)
3. Changes live in 1-5 minutes
```

### With Webhooks (Automated)

```
1. Update content in Ghost Admin
2. Ghost sends webhook to CI/CD
3. CI/CD automatically:
   - Fetches new content
   - Builds static site
   - Deploys to CDN
4. Changes live in 2-5 minutes
```

#### Setting up Ghost Webhooks

1. Ghost Admin → Settings → Integrations
2. Create custom integration
3. Copy Content API key
4. Add webhook:
   - Event: "Site changed"
   - Target URL: Your CI/CD webhook URL
     - Netlify: Build hook URL
     - Vercel: Deploy hook URL
     - GitHub Actions: Repository dispatch webhook

## File Structure

```
JOS.StayPuft/
│
├── 📝 Content Management
│   ├── _data/                    # Ghost content (JSON)
│   │   ├── posts.json           # ← Fetched from Ghost API
│   │   ├── pages.json           # ← Fetched from Ghost API
│   │   ├── tags.json            # ← Fetched from Ghost API
│   │   ├── authors.json         # ← Fetched from Ghost API
│   │   ├── settings.json        # ← Fetched from Ghost API
│   │   └── site.js              # Data transformer
│   │
├── 🎨 Templates (Handlebars)
│   ├── default.hbs              # Main layout
│   ├── index.hbs                # Homepage
│   ├── post.hbs                 # Single post
│   ├── page.hbs                 # Static page
│   ├── tag.hbs                  # Tag archive
│   ├── author.hbs               # Author page
│   └── partials/                # Reusable components
│
├── 🎭 Assets
│   ├── assets/css/              # Source CSS
│   ├── assets/js/               # Source JavaScript
│   └── assets/built/            # Built CSS/JS
│
├── 🔧 Configuration
│   ├── .eleventy.js             # Eleventy config
│   ├── .env                     # Environment variables
│   ├── package.json             # Dependencies and scripts
│   ├── build.js                 # Asset build script
│   └── rollup.config.js         # JavaScript bundler
│
├── 📜 Scripts
│   ├── scripts/fetch-ghost-content.js    # Fetch from API
│   ├── scripts/static-build.js           # Build orchestrator
│   └── scripts/create-sample-data.js     # Sample data
│
├── 📚 Documentation
│   ├── STATIC_SITE_INVESTIGATION.md      # Research & analysis
│   ├── STATIC_SITE_SETUP.md              # Setup guide
│   ├── STATIC_SITE_POC.md                # POC guide
│   └── docs/
│       ├── COMPARISON.md                 # Dynamic vs Static
│       └── WORKFLOW.md                   # This file
│
└── 🚀 Output
    └── _site/                   # Generated static site
        ├── index.html           # Ready to deploy!
        ├── */index.html         # All pages
        └── assets/              # Optimized assets
```

## Timeline Comparison

### Dynamic Ghost Theme

```
Content Update → Users See Changes
      ↓
   Instant
```

### Static Site Generation

```
Content Update → Build Process → Deploy → Users See Changes
      ↓              ↓              ↓
   Instant       1-3 min        30s-1min
                  
Total: 2-5 minutes
```

## Performance Metrics

### Build Performance

- **Small site** (< 50 posts): 10-30 seconds
- **Medium site** (50-200 posts): 30-90 seconds
- **Large site** (200-500 posts): 1-3 minutes
- **Very large site** (500+ posts): 3-10 minutes

### Runtime Performance

- **First page load**: 100-500ms (vs 1-3s dynamic)
- **Subsequent loads**: 50-100ms (from cache)
- **Time to Interactive**: < 1 second
- **Lighthouse Score**: 95-100 (vs 75-85 dynamic)

## Optimization Tips

### Faster Builds

1. **Incremental builds**: Only rebuild changed content
2. **Parallel processing**: Fetch content in parallel (already implemented)
3. **Caching**: Cache `_data/` if content unchanged
4. **Selective builds**: Build only certain pages during development

### Better Performance

1. **Image optimization**: Resize and compress images
2. **Critical CSS**: Inline critical styles (already implemented)
3. **Lazy loading**: Load images on scroll
4. **Code splitting**: Separate JS bundles for different pages
5. **Service Worker**: Cache assets for offline use

## Troubleshooting

### Build takes too long
- Check network speed (API fetching)
- Optimize templates (remove unnecessary processing)
- Use build caching
- Consider incremental builds

### Content not updating
- Verify webhook is configured
- Check build logs
- Ensure API key is valid
- Verify content is published in Ghost

### Missing assets
- Run `npm run build` before `eleventy`
- Check passthrough copy configuration
- Verify asset paths in templates

## Next Steps

1. ✅ Review [STATIC_SITE_POC.md](../STATIC_SITE_POC.md) for quick start
2. ✅ Read [STATIC_SITE_SETUP.md](../STATIC_SITE_SETUP.md) for detailed setup
3. ✅ See [STATIC_SITE_INVESTIGATION.md](../STATIC_SITE_INVESTIGATION.md) for analysis
4. ✅ Test with sample data: `npm run static:sample`
5. ✅ Deploy your first static site!
