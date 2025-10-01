const fs = require('fs');
const path = require('path');
const { marked } = require('marked');
const matter = require('gray-matter');

// Site configuration
const siteConfig = {
  title: 'Josef Ottosson',
  description: 'Freelancing Developer · Microsoft MVP',
  url: 'https://josef.codes',
  locale: 'en',
  cover_image: 'https://josef.codes/content/images/2017/05/header.jpg'
};

// Configure marked for syntax highlighting
marked.setOptions({
  gfm: true,
  breaks: false
});

// Helper functions
function formatDate(date, format) {
  const d = new Date(date);
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 
                  'July', 'August', 'September', 'October', 'November', 'December'];
  
  if (format === 'YYYY-MM-DD') {
    return d.toISOString().split('T')[0];
  } else if (format === 'MMMM Do, YYYY') {
    const day = d.getDate();
    const suffix = ['th', 'st', 'nd', 'rd'];
    const v = day % 100;
    return `${months[d.getMonth()]} ${day}${(suffix[(v - 20) % 10] || suffix[v] || suffix[0])}, ${d.getFullYear()}`;
  }
  return d.toISOString();
}

function timeAgo(date) {
  const seconds = Math.floor((new Date() - new Date(date)) / 1000);
  const intervals = {
    year: 31536000,
    month: 2592000,
    week: 604800,
    day: 86400,
    hour: 3600,
    minute: 60
  };
  
  for (const [name, value] of Object.entries(intervals)) {
    const interval = Math.floor(seconds / value);
    if (interval >= 1) {
      return interval === 1 ? `${interval} ${name} ago` : `${interval} ${name}s ago`;
    }
  }
  return 'just now';
}

function readingTime(content) {
  const wordsPerMinute = 200;
  const words = content.trim().split(/\s+/).length;
  const minutes = Math.ceil(words / wordsPerMinute);
  return `${minutes} min read`;
}

function getExcerpt(content, words = 33) {
  const text = content.replace(/<[^>]*>/g, '').replace(/\n/g, ' ');
  const wordArray = text.split(/\s+/).slice(0, words);
  return wordArray.join(' ') + (wordArray.length >= words ? '...' : '');
}

// Read all posts
function readPosts() {
  const postsDir = path.join(__dirname, 'posts');
  const files = fs.readdirSync(postsDir).filter(f => f.endsWith('.md'));
  
  const posts = files.map(file => {
    const filePath = path.join(postsDir, file);
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const { data, content } = matter(fileContent);
    
    const html = marked(content);
    
    return {
      title: data.title,
      slug: data.slug,
      url: `/${data.slug}/`,
      date: new Date(data.date),
      description: data.description,
      tags: data.tags || [],
      primary_tag: data.tags && data.tags.length > 0 ? {
        name: data.tags[0],
        slug: data.tags[0].toLowerCase().replace(/\s+/g, '-'),
        url: `/tag/${data.tags[0].toLowerCase().replace(/\s+/g, '-')}/`
      } : null,
      content: html,
      html: html,
      excerpt: getExcerpt(content),
      reading_time: readingTime(content),
      feature_image: data.feature_image || null,
      featured: data.featured || false
    };
  });
  
  // Sort by date, newest first
  posts.sort((a, b) => b.date - a.date);
  
  return posts;
}

// Generate HTML layout
function generateLayout(bodyClass, title, bodyContent) {
  return `<!DOCTYPE html>
<html lang="${siteConfig.locale}">
<head>
    <meta charset="utf-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <title>${title}</title>
    <meta name="HandheldFriendly" content="True" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    
    <style>
          /* Critical layout structure */
          .site-wrapper {
            display: flex;
            flex-direction: column;
            min-height: 100vh;
          }
          
          .site-main {
            z-index: 100;
            flex-grow: 1;
          }
          
          /* Critical sidebar header structure */
          .site-header {
            position: relative;
            padding-top: 12px;
            padding-bottom: 12px;
            color: #fff;
            margin: 2em 0;
          }
          
          .site-header-content {
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            padding: 10vw 4vw;
            min-height: 200px;
            max-height: 450px;
            text-align: center;
          }
          
          .site-title {
            z-index: 10;
            margin: 0;
            padding: 0;
            font-size: 3.8rem;
            font-weight: 700;
            line-height: 1.15;
            text-rendering: optimizeLegibility;
          }
          
          .site-logo {
            max-height: 45px;
          }
          
          .site-description {
            z-index: 10;
            margin: 0;
            padding: 5px 0;
            font-size: 2.2rem;
            font-weight: 300;
            letter-spacing: 0.5px;
            opacity: 0.8;
            line-height: 1.3em;
          }
          
          /* Critical navigation structure */
          .site-nav {
            position: relative;
            z-index: 300;
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            overflow-y: hidden;
            height: 40px;
            font-size: 1.2rem;
          }
          
          .site-nav-left {
            display: flex;
            align-items: center;
            overflow-x: auto;
            overflow-y: hidden;
            margin-right: 10px;
            padding-bottom: 80px;
            letter-spacing: 0.4px;
            white-space: nowrap;
          }
          
          .site-nav-logo {
            flex-shrink: 0;
            display: block;
            margin-right: 24px;
            padding: 11px 0;
            color: #fff;
            font-size: 1.7rem;
            line-height: 1em;
            font-weight: bold;
            letter-spacing: -0.5px;
          }
          
          .site-nav-right {
            flex-shrink: 0;
            display: flex;
            align-items: center;
            height: 40px;
          }
          
          .nav {
            display: flex;
            margin: 0 0 0 -12px;
            padding: 0;
            list-style: none;
          }
          
          /* Critical footer structure */
          .site-footer {
            position: relative;
            padding-top: 20px;
            padding-bottom: 60px;
            color: #fff;
          }
          
          .site-footer-content {
            display: flex;
            flex-wrap: wrap;
            justify-content: space-between;
            align-items: center;
            font-size: 1.3rem;
          }
          
          .site-footer-nav {
            display: flex;
          }
          
          /* Critical post feed layout */
          .post-feed {
            position: relative;
            display: flex;
            flex-wrap: wrap;
            margin: 0 -20px;
            padding: 40px 0 0 0;
          }
          
          /* Critical post card layout */
          .post-card {
            flex: 1 1 300px;
            display: flex;
            flex-direction: column;
            overflow: hidden;
            margin: 0 20px 40px;
            min-height: 300px;
            background: #fff center center;
            background-size: cover;
            border-radius: 5px;
          }
          
          .post-card-content {
            flex-grow: 1;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
          }
          
          /* Critical post card image layout */
          .post-card-image-link {
            position: relative;
            display: block;
            overflow: hidden;
            border-radius: 5px 5px 0 0;
            aspect-ratio: 16 / 9;
          }
          
          .post-card-image {
            width: 100%;
            height: 100%;
            background: #c5d2d9 no-repeat center center;
            object-fit: cover;
          }
          
          /* Critical post title structure for mobile */
          .post-full-title {
            margin: 0 0 0.5em 0;
            font-size: 4.6rem;
            font-weight: 700;
            line-height: 1.15;
            text-rendering: optimizeLegibility;
          }
          
          /* Mobile responsive adjustments */
          @media (max-width: 500px) {
            .site-title {
              font-size: 3rem;
              line-height: 1.15;
            }
            .site-description {
              font-size: 1.8rem;
              line-height: 1.3em;
            }
            .post-full-title {
              font-size: 2.9rem;
              line-height: 1.15;
            }
          }
          
          @media (max-width: 700px) {
            .site-nav-left {
              margin-right: 0;
              padding-left: 4vw;
            }
            .site-nav-right {
              display: none;
            }
          }
          
          @media (max-width: 650px) {
            .site-footer-content {
              flex-direction: column;
            }
          }
          
          /* Desktop sidebar positioning */
          @media (min-width: 1280px) {
            #sidebar {
                position: fixed;
                width: 320px;
                height: 100%;
            }

            #site-main {
                position: absolute;
                left: 320px;
            }
          }
          
          /* Critical template-specific styles */
          @media (min-width: 900px) {
            .home-template .post-feed,
            .tag-template .post-feed,
            .author-template .post-feed {
              margin-top: -70px;
              padding-top: 0;
            }
            .home-template .site-nav {
              position: relative;
              top: -70px;
            }
          }
          
          .home-template .site-header:after {
            display: none;
          }
    </style>
    
    <link rel="preload" href="/assets/css/fonts/josefottossonse.woff" as="font" type="font/woff" crossorigin>
    <link rel="preload" href="/assets/built/theme.css" as="style" onload="this.onload=null;this.rel='stylesheet'">
    <noscript><link rel="stylesheet" href="/assets/built/theme.css"></noscript>
</head>
<body class="${bodyClass}">
    <div class="site-wrapper">
        <div id="sidebar" style="background-image: url(${siteConfig.cover_image})">
            <div>
                <header class="site-header">
                    <div class="site-header-content">
                        <div class="site-header-picture">
                        </div>
                        <div class="site-header-text">
                            <a href="/"><h1 class="site-title">${siteConfig.title}</h1></a>
                            <h2 class="site-description">${siteConfig.description}</h2>
                        </div>
                    </div>
                </header>
            </div>
            <nav class="main-nav">
            </nav>
            <div class="landscape">
                <footer class="site-footer">
                    <div class="site-footer-content">
                        <nav class="site-footer-subscribe">
                            <a href="/rss.xml" aria-label="Subscribe via RSS" target="_blank"><i class="fa fa-rss"></i>Subscribe via RSS</a>
                        </nav>
                        <nav class="site-footer-external">
                        </nav>
                        <nav class="site-footer-text">
                            <section class="copyright">&copy; <a href="/" aria-label="${siteConfig.title}">${siteConfig.title}</a> ${new Date().getFullYear()}</section>
                        </nav>
                    </div>
                </footer>
            </div>
        </div>

        <main id="site-main" class="site-main outer">
            <div class="inner">
                <div class="main-body">
                    ${bodyContent}
                </div>
            </div>
        </main>

        <div class="portrait">
            <footer class="site-footer">
                <div class="site-footer-content">
                    <nav class="site-footer-subscribe">
                        <a href="/rss.xml" aria-label="Subscribe via RSS" target="_blank"><i class="fa fa-rss"></i>Subscribe via RSS</a>
                    </nav>
                    <nav class="site-footer-external">
                    </nav>
                    <nav class="site-footer-text">
                        <section class="copyright">&copy; <a href="/" aria-label="${siteConfig.title}">${siteConfig.title}</a> ${new Date().getFullYear()}</section>
                    </nav>
                </div>
            </footer>
        </div>
    </div>

    <script defer async src="/assets/built/theme.js"></script>
</body>
</html>`;
}

// Generate post card HTML
function generatePostCard(post) {
  return `<article class="post-card">
    ${post.feature_image ? `
    <a class="post-card-image-link" href="${post.url}">
        <img class="post-card-image"
            src="${post.feature_image}"
            alt="${post.title}"
            loading="lazy"
        />
    </a>` : ''}

    <div class="post-card-content">
        <a class="post-card-content-link" href="${post.url}">
            <header class="post-card-header">
                ${post.primary_tag ? `<span class="post-card-tags"><i class='fa fa-tag'></i> ${post.primary_tag.name}</span>` : ''}
                <h2 class="post-card-title">${post.title}</h2>
            </header>

            <section class="post-card-excerpt">
                <p>${post.excerpt}</p>
            </section>
        </a>

        <footer class="post-card-meta">
            <span class="post-time">
                <i class='fa fa-calendar'></i>
                <time datetime="${formatDate(post.date, 'YYYY-MM-DD')}" class="timeago">${timeAgo(post.date)}</time>
                <time datetime="${formatDate(post.date, 'YYYY-MM-DD')}" class="fulldate">${formatDate(post.date, 'MMMM Do, YYYY')}</time>
            </span>

            ${post.featured ? 
              `<span class="featured-badge">Featured</span>` :
              `<span class="reading-time">${post.reading_time}</span>`
            }
        </footer>
    </div>
</article>`;
}

// Generate index page
function generateIndex(posts, outputDir) {
  const postCards = posts.map(post => generatePostCard(post)).join('\n');
  const bodyContent = `<div class="post-feed">\n${postCards}\n</div>`;
  const html = generateLayout('home-template', siteConfig.title, bodyContent);
  
  const indexPath = path.join(outputDir, 'index.html');
  fs.writeFileSync(indexPath, html);
  console.log('Generated: index.html');
}

// Generate individual post pages
function generatePost(post, posts, outputDir) {
  const bodyContent = `<article class="post-full ${!post.feature_image ? 'no-image' : ''}">
    <header class="post-full-header">
        <h1 class="post-full-title">${post.title}</h1>
        <section class="post-full-meta">
            <span class="post-time">
                <i class='fa fa-calendar'></i>
                <time datetime="${formatDate(post.date, 'YYYY-MM-DD')}" class="timeago">${timeAgo(post.date)}</time>
                <time datetime="${formatDate(post.date, 'YYYY-MM-DD')}" class="fulldate">${formatDate(post.date, 'MMMM Do, YYYY')}</time>
            </span>
            ${post.primary_tag ? `<div class='post-tags'><i class='fa fa-tag'></i> <a href="${post.primary_tag.url}">${post.primary_tag.name}</a></div>` : ''}
        </section>
    </header>

    ${post.feature_image ? `
    <figure class="post-full-image">
        <img
            src="${post.feature_image}"
            alt="${post.title}"
        />
    </figure>` : ''}

    <section class="post-full-content">
        <div class="post-content">
            ${post.content}
        </div>
    </section>

    <footer class="post-full-footer">
        <section class="author-card">
            <section class="author-card-content">
                <h4 class="author-card-name"><a href="/">${siteConfig.title}</a></h4>
                <p>${siteConfig.description}</p>
            </section>
        </section>
    </footer>
</article>`;

  const html = generateLayout('post-template', `${post.title} - ${siteConfig.title}`, bodyContent);
  
  const postDir = path.join(outputDir, post.slug);
  if (!fs.existsSync(postDir)) {
    fs.mkdirSync(postDir, { recursive: true });
  }
  
  const postPath = path.join(postDir, 'index.html');
  fs.writeFileSync(postPath, html);
  console.log(`Generated: ${post.slug}/index.html`);
}

// Generate RSS feed
function generateRSS(posts, outputDir) {
  const items = posts.map(post => `
    <item>
      <title><![CDATA[${post.title}]]></title>
      <description><![CDATA[${post.description}]]></description>
      <link>${siteConfig.url}${post.url}</link>
      <guid isPermaLink="false">${post.slug}</guid>
      ${post.tags.map(tag => `<category><![CDATA[${tag}]]></category>`).join('\n      ')}
      <dc:creator><![CDATA[${siteConfig.title}]]></dc:creator>
      <pubDate>${post.date.toUTCString()}</pubDate>
      <content:encoded><![CDATA[${post.content}]]></content:encoded>
    </item>
  `).join('');

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:content="http://purl.org/rss/1.0/modules/content/" xmlns:atom="http://www.w3.org/2005/Atom" version="2.0">
  <channel>
    <title><![CDATA[${siteConfig.title}]]></title>
    <description><![CDATA[${siteConfig.description}]]></description>
    <link>${siteConfig.url}/</link>
    <generator>Static Site Generator</generator>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${siteConfig.url}/rss.xml" rel="self" type="application/rss+xml"/>
    <ttl>60</ttl>
    ${items}
  </channel>
</rss>`;

  const rssPath = path.join(outputDir, 'rss.xml');
  fs.writeFileSync(rssPath, rss);
  console.log('Generated: rss.xml');
}

// Generate tag page
function generateTagPage(tagName, tagSlug, tagPosts, outputDir) {
  const postCards = tagPosts.map(post => generatePostCard(post)).join('\n');
  const bodyContent = `<div class="post-feed">\n${postCards}\n</div>`;
  const pageTitle = `${tagName} - ${siteConfig.title}`;
  const html = generateLayout('tag-template', pageTitle, bodyContent);
  
  const tagDir = path.join(outputDir, 'tag', tagSlug);
  if (!fs.existsSync(tagDir)) {
    fs.mkdirSync(tagDir, { recursive: true });
  }
  
  const tagPath = path.join(tagDir, 'index.html');
  fs.writeFileSync(tagPath, html);
  console.log(`Generated: tag/${tagSlug}/index.html`);
}

// Generate all tag pages
function generateAllTagPages(posts, outputDir) {
  // Collect all unique tags
  const tagsMap = new Map();
  
  posts.forEach(post => {
    if (post.tags && post.tags.length > 0) {
      post.tags.forEach(tag => {
        const tagSlug = tag.toLowerCase().replace(/\s+/g, '-');
        if (!tagsMap.has(tagSlug)) {
          tagsMap.set(tagSlug, { name: tag, slug: tagSlug, posts: [] });
        }
        tagsMap.get(tagSlug).posts.push(post);
      });
    }
  });
  
  // Generate a page for each tag
  tagsMap.forEach((tagData) => {
    generateTagPage(tagData.name, tagData.slug, tagData.posts, outputDir);
  });
  
  console.log(`Generated ${tagsMap.size} tag pages`);
}

// Generate author page
function generateAuthorPage(posts, outputDir) {
  const postCards = posts.map(post => generatePostCard(post)).join('\n');
  const bodyContent = `<div class="post-feed">\n${postCards}\n</div>`;
  const pageTitle = `${siteConfig.title}`;
  const html = generateLayout('author-template', pageTitle, bodyContent);
  
  const authorDir = path.join(outputDir, 'author', siteConfig.title.toLowerCase().replace(/\s+/g, '-'));
  if (!fs.existsSync(authorDir)) {
    fs.mkdirSync(authorDir, { recursive: true });
  }
  
  const authorPath = path.join(authorDir, 'index.html');
  fs.writeFileSync(authorPath, html);
  console.log(`Generated: author/${siteConfig.title.toLowerCase().replace(/\s+/g, '-')}/index.html`);
}

// Main build function
function build() {
  console.log('Building static site...');
  
  // Create output directory
  const outputDir = path.join(__dirname, 'dist');
  if (fs.existsSync(outputDir)) {
    fs.rmSync(outputDir, { recursive: true });
  }
  fs.mkdirSync(outputDir);
  
  // Copy assets
  const assetsDir = path.join(__dirname, 'assets');
  const outputAssetsDir = path.join(outputDir, 'assets');
  fs.cpSync(assetsDir, outputAssetsDir, { recursive: true });
  console.log('Copied assets');
  
  // Read posts and generate pages
  const posts = readPosts();
  console.log(`Found ${posts.length} posts`);
  
  generateIndex(posts, outputDir);
  posts.forEach(post => generatePost(post, posts, outputDir));
  generateAllTagPages(posts, outputDir);
  generateAuthorPage(posts, outputDir);
  generateRSS(posts, outputDir);
  
  console.log('Build complete!');
}

// Run build
build();
