const https = require('https');
const fs = require('fs');
const path = require('path');

// Fetch RSS feed and extract posts
function fetchRSS() {
  return new Promise((resolve, reject) => {
    https.get('https://josef.codes/rss/', (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

// Parse RSS XML to extract posts
function parseRSS(xml) {
  const items = [];
  const itemRegex = /<item>([\s\S]*?)<\/item>/g;
  let match;
  
  while ((match = itemRegex.exec(xml)) !== null) {
    const item = match[1];
    const title = (item.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>/) || [])[1] || '';
    const link = (item.match(/<link>(.*?)<\/link>/) || [])[1] || '';
    const pubDate = (item.match(/<pubDate>(.*?)<\/pubDate>/) || [])[1] || '';
    const description = (item.match(/<description><!\[CDATA\[(.*?)\]\]><\/description>/) || [])[1] || '';
    const content = (item.match(/<content:encoded><!\[CDATA\[([\s\S]*?)\]\]><\/content:encoded>/) || [])[1] || '';
    
    // Extract categories/tags
    const categories = [];
    const catRegex = /<category><!\[CDATA\[(.*?)\]\]><\/category>/g;
    let catMatch;
    while ((catMatch = catRegex.exec(item)) !== null) {
      categories.push(catMatch[1]);
    }
    
    items.push({
      title,
      link,
      pubDate: new Date(pubDate),
      description,
      content,
      categories
    });
  }
  
  return items;
}

// Convert HTML content to markdown (basic conversion)
function htmlToMarkdown(html) {
  return html
    .replace(/<p>/g, '\n')
    .replace(/<\/p>/g, '\n')
    .replace(/<h1>/g, '\n# ')
    .replace(/<\/h1>/g, '\n')
    .replace(/<h2>/g, '\n## ')
    .replace(/<\/h2>/g, '\n')
    .replace(/<h3>/g, '\n### ')
    .replace(/<\/h3>/g, '\n')
    .replace(/<strong>/g, '**')
    .replace(/<\/strong>/g, '**')
    .replace(/<em>/g, '*')
    .replace(/<\/em>/g, '*')
    .replace(/<a href="(.*?)">(.*?)<\/a>/g, '[$2]($1)')
    .replace(/<pre><code class="language-(.*?)">([\s\S]*?)<\/code><\/pre>/g, (match, lang, code) => {
      return '\n```' + lang + '\n' + code + '\n```\n';
    })
    .replace(/<pre><code>([\s\S]*?)<\/code><\/pre>/g, (match, code) => {
      return '\n```\n' + code + '\n```\n';
    })
    .replace(/<code>/g, '`')
    .replace(/<\/code>/g, '`')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .trim();
}

// Create markdown file with frontmatter
function createMarkdownFile(post, postsDir) {
  const slug = post.link.split('/').filter(Boolean).pop();
  const filename = `${post.pubDate.toISOString().split('T')[0]}-${slug}.md`;
  const filepath = path.join(postsDir, filename);
  
  const frontmatter = `---
title: ${JSON.stringify(post.title)}
slug: ${slug}
date: ${post.pubDate.toISOString()}
description: ${JSON.stringify(post.description)}
tags: ${JSON.stringify(post.categories)}
---

`;
  
  const markdown = htmlToMarkdown(post.content);
  fs.writeFileSync(filepath, frontmatter + markdown);
  console.log(`Created: ${filename}`);
}

// Main function
async function main() {
  const postsDir = path.join(__dirname, 'posts');
  if (!fs.existsSync(postsDir)) {
    fs.mkdirSync(postsDir);
  }
  
  console.log('Fetching RSS feed...');
  const xml = await fetchRSS();
  
  console.log('Parsing posts...');
  const posts = parseRSS(xml);
  
  console.log(`Found ${posts.length} posts`);
  posts.forEach(post => createMarkdownFile(post, postsDir));
  
  console.log('Done!');
}

main().catch(console.error);
