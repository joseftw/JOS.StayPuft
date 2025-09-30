#!/usr/bin/env node

/**
 * Convert Ghost JSON content to Markdown files for Eleventy
 * 
 * This script takes the JSON data fetched from Ghost and creates
 * individual markdown files that Eleventy can process.
 */

const fs = require('fs');
const path = require('path');

// Configuration
const DATA_DIR = path.join(__dirname, '../_data');
const CONTENT_DIR = path.join(__dirname, '../content');
const POSTS_DIR = path.join(CONTENT_DIR, 'posts');
const PAGES_DIR = path.join(CONTENT_DIR, 'pages');

/**
 * Ensure directories exist
 */
function ensureDirectories() {
  [CONTENT_DIR, POSTS_DIR, PAGES_DIR].forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });
}

/**
 * Convert HTML to markdown (basic conversion)
 * For better results, consider using libraries like turndown
 */
function htmlToMarkdown(html) {
  if (!html) return '';
  
  // Basic HTML to markdown conversion
  let md = html;
  
  // Remove HTML tags but keep content
  md = md.replace(/<h1[^>]*>(.*?)<\/h1>/gi, '\n# $1\n');
  md = md.replace(/<h2[^>]*>(.*?)<\/h2>/gi, '\n## $1\n');
  md = md.replace(/<h3[^>]*>(.*?)<\/h3>/gi, '\n### $1\n');
  md = md.replace(/<h4[^>]*>(.*?)<\/h4>/gi, '\n#### $1\n');
  md = md.replace(/<h5[^>]*>(.*?)<\/h5>/gi, '\n##### $1\n');
  md = md.replace(/<h6[^>]*>(.*?)<\/h6>/gi, '\n###### $1\n');
  
  md = md.replace(/<p[^>]*>(.*?)<\/p>/gi, '$1\n\n');
  md = md.replace(/<br\s*\/?>/gi, '\n');
  
  md = md.replace(/<strong[^>]*>(.*?)<\/strong>/gi, '**$1**');
  md = md.replace(/<b[^>]*>(.*?)<\/b>/gi, '**$1**');
  md = md.replace(/<em[^>]*>(.*?)<\/em>/gi, '*$1*');
  md = md.replace(/<i[^>]*>(.*?)<\/i>/gi, '*$1*');
  
  md = md.replace(/<a[^>]*href="([^"]*)"[^>]*>(.*?)<\/a>/gi, '[$2]($1)');
  md = md.replace(/<img[^>]*src="([^"]*)"[^>]*alt="([^"]*)"[^>]*\/?>/gi, '![$2]($1)');
  md = md.replace(/<img[^>]*src="([^"]*)"[^>]*\/?>/gi, '![]($1)');
  
  md = md.replace(/<code[^>]*>(.*?)<\/code>/gi, '`$1`');
  md = md.replace(/<pre[^>]*>(.*?)<\/pre>/gis, '```\n$1\n```');
  
  md = md.replace(/<ul[^>]*>(.*?)<\/ul>/gis, (match, content) => {
    return content.replace(/<li[^>]*>(.*?)<\/li>/gi, '- $1\n');
  });
  
  md = md.replace(/<ol[^>]*>(.*?)<\/ol>/gis, (match, content) => {
    let counter = 1;
    return content.replace(/<li[^>]*>(.*?)<\/li>/gi, () => {
      return `${counter++}. $1\n`;
    });
  });
  
  // Remove remaining HTML tags
  md = md.replace(/<[^>]+>/g, '');
  
  // Clean up whitespace
  md = md.replace(/\n{3,}/g, '\n\n');
  md = md.trim();
  
  return md;
}

/**
 * Create frontmatter for a post/page
 */
function createFrontmatter(item, type = 'post') {
  const frontmatter = {
    title: item.title,
    slug: item.slug,
    date: item.published_at || item.created_at,
    updated: item.updated_at,
    excerpt: item.excerpt || item.custom_excerpt || '',
    featured: item.featured || false,
    layout: type === 'post' ? 'post' : 'page',
    permalink: type === 'post' ? `/${item.slug}/` : `/${item.slug}/`
  };
  
  if (item.feature_image) {
    frontmatter.feature_image = item.feature_image;
  }
  
  if (item.tags && item.tags.length > 0) {
    frontmatter.tags = item.tags.map(tag => tag.name);
  }
  
  if (item.authors && item.authors.length > 0) {
    frontmatter.author = item.authors[0].name;
  }
  
  return frontmatter;
}

/**
 * Convert a post to markdown file
 */
function convertPost(post) {
  const frontmatter = createFrontmatter(post, 'post');
  
  // Use plaintext if available, otherwise convert HTML
  let content = post.plaintext || htmlToMarkdown(post.html || '');
  
  // Create markdown file content
  const yaml = Object.entries(frontmatter)
    .map(([key, value]) => {
      if (Array.isArray(value)) {
        return `${key}:\n${value.map(v => `  - ${v}`).join('\n')}`;
      } else if (typeof value === 'string' && value.includes('\n')) {
        return `${key}: |\n  ${value.replace(/\n/g, '\n  ')}`;
      } else if (typeof value === 'boolean') {
        return `${key}: ${value}`;
      } else {
        return `${key}: "${value}"`;
      }
    })
    .join('\n');
  
  const markdown = `---\n${yaml}\n---\n\n${content}\n`;
  
  // Write to file
  const filename = `${post.slug}.md`;
  const filepath = path.join(POSTS_DIR, filename);
  fs.writeFileSync(filepath, markdown);
  
  return filename;
}

/**
 * Convert a page to markdown file
 */
function convertPage(page) {
  const frontmatter = createFrontmatter(page, 'page');
  
  // Use plaintext if available, otherwise convert HTML
  let content = page.plaintext || htmlToMarkdown(page.html || '');
  
  // Create markdown file content
  const yaml = Object.entries(frontmatter)
    .map(([key, value]) => {
      if (Array.isArray(value)) {
        return `${key}:\n${value.map(v => `  - ${v}`).join('\n')}`;
      } else if (typeof value === 'string' && value.includes('\n')) {
        return `${key}: |\n  ${value.replace(/\n/g, '\n  ')}`;
      } else if (typeof value === 'boolean') {
        return `${key}: ${value}`;
      } else {
        return `${key}: "${value}"`;
      }
    })
    .join('\n');
  
  const markdown = `---\n${yaml}\n---\n\n${content}\n`;
  
  // Write to file
  const filename = `${page.slug}.md`;
  const filepath = path.join(PAGES_DIR, filename);
  fs.writeFileSync(filepath, markdown);
  
  return filename;
}

/**
 * Main conversion function
 */
function main() {
  console.log('🔄 Converting Ghost content to Markdown files...\n');
  
  // Ensure output directories exist
  ensureDirectories();
  
  // Load JSON data
  const postsPath = path.join(DATA_DIR, 'posts.json');
  const pagesPath = path.join(DATA_DIR, 'pages.json');
  
  let postsConverted = 0;
  let pagesConverted = 0;
  
  // Convert posts
  if (fs.existsSync(postsPath)) {
    console.log('📝 Converting posts...');
    const posts = JSON.parse(fs.readFileSync(postsPath, 'utf8'));
    posts.forEach(post => {
      const filename = convertPost(post);
      console.log(`   ✅ ${filename}`);
      postsConverted++;
    });
  } else {
    console.log('⚠️  No posts.json found - run npm run static:fetch first');
  }
  
  // Convert pages
  if (fs.existsSync(pagesPath)) {
    console.log('\n📄 Converting pages...');
    const pages = JSON.parse(fs.readFileSync(pagesPath, 'utf8'));
    pages.forEach(page => {
      const filename = convertPage(page);
      console.log(`   ✅ ${filename}`);
      pagesConverted++;
    });
  } else {
    console.log('⚠️  No pages.json found - run npm run static:fetch first');
  }
  
  console.log('\n✨ Conversion completed!');
  console.log(`   Posts: ${postsConverted}`);
  console.log(`   Pages: ${pagesConverted}`);
  console.log('\nNext steps:');
  console.log('   1. Review generated markdown in content/ directory');
  console.log('   2. Run: npm run static:build');
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { main, convertPost, convertPage, htmlToMarkdown };
