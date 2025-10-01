# Deployment Guide

This guide explains how to deploy your static site to various hosting platforms.

## Prerequisites

Before deploying, make sure you have:

1. Generated the static site: `npm run generate`
2. The `dist/` folder contains all necessary files
3. All posts are in the `posts/` directory

## GitHub Pages

### Option 1: Manual Deployment

1. Go to your repository settings on GitHub
2. Navigate to "Pages" section
3. Set source to "GitHub Actions" or a specific branch
4. Push the `dist/` folder contents to the `gh-pages` branch:

```bash
cd dist
git init
git add .
git commit -m "Deploy to GitHub Pages"
git remote add origin https://github.com/yourusername/yourrepo.git
git push -f origin main:gh-pages
```

### Option 2: GitHub Actions (Recommended)

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy Static Site

on:
  push:
    branches: [ main ]
  workflow_dispatch:

jobs:
  build-deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        
    - name: Install dependencies
      run: npm install
      
    - name: Build assets
      run: npm run build
      
    - name: Generate site
      run: node generate.js
      
    - name: Deploy to GitHub Pages
      uses: peaceiris/actions-gh-pages@v3
      with:
        github_token: ${{ secrets.GITHUB_TOKEN }}
        publish_dir: ./dist
```

## Netlify

### Option 1: Drag and Drop

1. Go to https://app.netlify.com
2. Drag the `dist/` folder into the deploy area
3. Done!

### Option 2: Continuous Deployment

1. Connect your GitHub repository to Netlify
2. Configure build settings:
   - **Build command**: `npm run generate`
   - **Publish directory**: `dist`
3. Deploy!

Create a `netlify.toml` file for configuration:

```toml
[build]
  command = "npm run generate"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 404
```

## Vercel

1. Install Vercel CLI: `npm install -g vercel`
2. Run `vercel` in your project directory
3. Or connect your GitHub repository at https://vercel.com

Create a `vercel.json` file:

```json
{
  "buildCommand": "npm run generate",
  "outputDirectory": "dist"
}
```

## AWS S3 + CloudFront

### Upload to S3

```bash
aws s3 sync dist/ s3://your-bucket-name --delete
```

### CloudFront Setup

1. Create a CloudFront distribution
2. Set origin to your S3 bucket
3. Configure SSL certificate
4. Set default root object to `index.html`
5. Configure error pages (404 -> /index.html)

## Custom Server (nginx)

Upload the `dist/` folder to your server and configure nginx:

```nginx
server {
    listen 80;
    server_name yourdomain.com;
    root /var/www/your-site/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache static assets
    location ~* \.(css|js|jpg|jpeg|png|gif|ico|woff|woff2)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml;
}
```

## Cloudflare Pages

1. Connect your GitHub repository
2. Configure build settings:
   - **Build command**: `npm run generate`
   - **Build output directory**: `dist`
3. Deploy!

## Custom Domain Setup

After deploying, configure your custom domain:

1. Update DNS records to point to your hosting provider
2. Update the `siteConfig.url` in `generate.js`:

```javascript
const siteConfig = {
  title: 'Josef Ottosson',
  description: 'Freelancing Developer · Microsoft MVP',
  url: 'https://yourdomain.com',  // Update this!
  locale: 'en',
  cover_image: 'https://yourdomain.com/cover.jpg'
};
```

3. Regenerate the site: `npm run generate`
4. Redeploy

## Automating Updates

### Adding a New Post

1. Create a markdown file in `posts/`:
   ```bash
   touch posts/2025-01-15-my-new-post.md
   ```

2. Write your post with frontmatter:
   ```markdown
   ---
   title: "My New Post"
   slug: my-new-post
   date: 2025-01-15T10:00:00.000Z
   description: "Post description"
   tags: ["tag1", "tag2"]
   ---
   
   Your content here...
   ```

3. Generate and deploy:
   ```bash
   npm run generate
   # Then deploy using your chosen method
   ```

### Fetching from RSS (Optional)

If you want to import posts from an existing Ghost site:

```bash
npm run fetch-posts
npm run generate
```

This will fetch posts from the RSS feed configured in `fetch-posts.js`.

## Performance Tips

1. **Enable compression**: Make sure gzip/brotli compression is enabled on your server
2. **Use a CDN**: Serve assets through a CDN like Cloudflare or AWS CloudFront
3. **Optimize images**: Compress images before adding them to posts
4. **Cache headers**: Set appropriate cache headers for static assets
5. **HTTP/2**: Use HTTP/2 for better performance with multiple assets

## Troubleshooting

### CSS not loading

Make sure asset paths are correct. They should be `/assets/built/theme.css` in the generated HTML.

### Posts not showing

Check that:
- Markdown files have proper frontmatter
- Date is in ISO 8601 format
- Files are in the `posts/` directory

### Build fails

1. Clear node_modules and reinstall: `rm -rf node_modules && npm install`
2. Make sure all dependencies are installed
3. Check Node.js version (requires Node 18+)

## Monitoring

After deployment, monitor your site:

1. Set up analytics (Google Analytics, Plausible, etc.)
2. Monitor uptime with a service like UptimeRobot
3. Check server logs for errors
4. Set up alerts for downtime

## Backup

Always keep backups of:

1. The `posts/` directory (your content)
2. Any custom modifications to `generate.js`
3. Custom CSS/JS in the `assets/` directory

Consider storing these in version control (Git) for easy recovery.
