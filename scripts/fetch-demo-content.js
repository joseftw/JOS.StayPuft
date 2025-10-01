#!/usr/bin/env node

/**
 * Fetch posts from Ghost Content API and save as markdown files
 */

const fs = require('fs');
const path = require('path');

// Ghost demo site - public API
const GHOST_URL = 'https://demo.ghost.io';
const GHOST_KEY = '22444f78447824223cefc48062'; // Public demo API key

const POSTS_DIR = path.join(__dirname, '../posts');

// Ensure posts directory exists
if (!fs.existsSync(POSTS_DIR)) {
  fs.mkdirSync(POSTS_DIR, { recursive: true });
}

// Simple fetch without dependencies
async function fetchPosts() {
  console.log('📥 Fetching posts from Ghost demo...\n');
  
  const url = `${GHOST_URL}/ghost/api/v3/content/posts/?key=${GHOST_KEY}&include=tags,authors&limit=all`;
  
  try {
    const https = require('https');
    
    return new Promise((resolve, reject) => {
      https.get(url, (res) => {
        let data = '';
        
        res.on('data', (chunk) => {
          data += chunk;
        });
        
        res.on('end', () => {
          try {
            const json = JSON.parse(data);
            resolve(json.posts || []);
          } catch (e) {
            reject(e);
          }
        });
      }).on('error', reject);
    });
  } catch (error) {
    console.error('Error fetching posts:', error.message);
    return [];
  }
}

function htmlToMarkdown(html) {
  if (!html) return '';
  
  // Basic HTML to markdown conversion
  let md = html;
  
  // Headings
  md = md.replace(/<h1[^>]*>(.*?)<\/h1>/gi, '\n# $1\n');
  md = md.replace(/<h2[^>]*>(.*?)<\/h2>/gi, '\n## $1\n');
  md = md.replace(/<h3[^>]*>(.*?)<\/h3>/gi, '\n### $1\n');
  md = md.replace(/<h4[^>]*>(.*?)<\/h4>/gi, '\n#### $1\n');
  
  // Paragraphs and breaks
  md = md.replace(/<p[^>]*>(.*?)<\/p>/gi, '$1\n\n');
  md = md.replace(/<br\s*\/?>/gi, '\n');
  
  // Text formatting
  md = md.replace(/<strong[^>]*>(.*?)<\/strong>/gi, '**$1**');
  md = md.replace(/<b[^>]*>(.*?)<\/b>/gi, '**$1**');
  md = md.replace(/<em[^>]*>(.*?)<\/em>/gi, '*$1*');
  md = md.replace(/<i[^>]*>(.*?)<\/i>/gi, '*$1*');
  
  // Links and images
  md = md.replace(/<a[^>]*href="([^"]*)"[^>]*>(.*?)<\/a>/gi, '[$2]($1)');
  md = md.replace(/<img[^>]*src="([^"]*)"[^>]*alt="([^"]*)"[^>]*\/?>/gi, '![$2]($1)');
  md = md.replace(/<img[^>]*src="([^"]*)"[^>]*\/?>/gi, '![]($1)');
  
  // Code
  md = md.replace(/<code[^>]*>(.*?)<\/code>/gi, '`$1`');
  md = md.replace(/<pre[^>]*><code[^>]*>(.*?)<\/code><\/pre>/gis, '```\n$1\n```');
  
  // Lists
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

function createMarkdownFile(post) {
  const frontmatter = {
    layout: 'post.njk',
    title: post.title,
    slug: post.slug,
    date: post.published_at ? post.published_at.split('T')[0] : new Date().toISOString().split('T')[0],
    tags: post.tags ? post.tags.map(t => t.name) : [],
    author: post.authors && post.authors[0] ? post.authors[0].name : 'Unknown',
    excerpt: post.excerpt || post.custom_excerpt || '',
    featured: post.featured || false
  };
  
  if (post.feature_image) {
    frontmatter.feature_image = post.feature_image;
  }
  
  // Create YAML frontmatter
  let yaml = '---\n';
  for (const [key, value] of Object.entries(frontmatter)) {
    if (Array.isArray(value)) {
      if (value.length > 0) {
        yaml += `${key}:\n`;
        value.forEach(v => yaml += `  - ${v}\n`);
      }
    } else if (typeof value === 'boolean') {
      yaml += `${key}: ${value}\n`;
    } else if (value) {
      // Escape quotes and use multiline string for long or problematic text
      const stringValue = String(value).replace(/"/g, '\\"');
      if (key === 'excerpt' || stringValue.length > 100 || stringValue.includes('\n')) {
        yaml += `${key}: |\n  ${stringValue.split('\n').join('\n  ')}\n`;
      } else {
        yaml += `${key}: "${stringValue}"\n`;
      }
    }
  }
  yaml += '---\n\n';
  
  // Convert HTML to markdown
  const content = htmlToMarkdown(post.html || '');
  
  const markdown = yaml + content;
  
  // Write to file
  const filename = `${post.slug}.md`;
  const filepath = path.join(POSTS_DIR, filename);
  fs.writeFileSync(filepath, markdown);
  
  return filename;
}

async function main() {
  console.log('🚀 Fetching posts from Ghost demo site...\n');
  
  const posts = await fetchPosts();
  
  if (posts.length === 0) {
    console.log('❌ No posts found or error fetching posts');
    return;
  }
  
  console.log(`✅ Found ${posts.length} posts\n`);
  console.log('📝 Converting to markdown...\n');
  
  let count = 0;
  for (const post of posts.slice(0, 10)) { // Only take first 10 posts
    const filename = createMarkdownFile(post);
    console.log(`   ✅ ${filename}`);
    count++;
  }
  
  console.log(`\n✨ Created ${count} markdown files in posts/`);
  console.log('\nNext steps:');
  console.log('   1. Run: npm run build');
  console.log('   2. Run: npx eleventy');
  console.log('   3. Or: npx eleventy --serve');
}

main().catch(console.error);
