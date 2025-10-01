#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const https = require('https');
const { parseStringPromise } = require('xml2js');

const RSS_URL = 'https://josef.codes/rss';
const POSTS_DIR = path.join(__dirname, '..', 'posts');

// Ensure posts directory exists
if (!fs.existsSync(POSTS_DIR)) {
    fs.mkdirSync(POSTS_DIR, { recursive: true });
}

// Fetch RSS feed
function fetchRSS() {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'josef.codes',
            port: 443,
            path: '/rss/',  // Note: added trailing slash to avoid redirect
            method: 'GET',
            headers: {
                'User-Agent': 'Mozilla/5.0 (compatible; RSS fetcher)'
            }
        };
        
        https.get(options, (res) => {
            console.log('Status:', res.statusCode);
            
            if (res.statusCode === 301 || res.statusCode === 302) {
                console.log('Following redirect to:', res.headers.location);
                // Follow redirect
                const newPath = res.headers.location;
                options.path = newPath;
                https.get(options, (res2) => {
                    let data = '';
                    res2.on('data', (chunk) => data += chunk);
                    res2.on('end', () => resolve(data));
                }).on('error', reject);
                return;
            }
            
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                console.log('Final data length:', data.length);
                resolve(data);
            });
        }).on('error', (err) => {
            console.error('Request error:', err);
            reject(err);
        });
    });
}

// Basic HTML to Markdown conversion
function htmlToMarkdown(html) {
    if (!html) return '';
    
    let md = html;
    
    // Code blocks
    md = md.replace(/<pre><code class="language-(\w+)">([\s\S]*?)<\/code><\/pre>/g, (match, lang, code) => {
        // Decode HTML entities in code
        code = code.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&apos;/g, "'");
        return `\n\`\`\`${lang}\n${code}\n\`\`\`\n`;
    });
    
    // Inline code
    md = md.replace(/<code>(.*?)<\/code>/g, '`$1`');
    
    // Headers
    md = md.replace(/<h1>(.*?)<\/h1>/g, '\n# $1\n');
    md = md.replace(/<h2>(.*?)<\/h2>/g, '\n## $1\n');
    md = md.replace(/<h3>(.*?)<\/h3>/g, '\n### $1\n');
    md = md.replace(/<h4>(.*?)<\/h4>/g, '\n#### $1\n');
    
    // Paragraphs
    md = md.replace(/<p>(.*?)<\/p>/g, '\n$1\n');
    
    // Links
    md = md.replace(/<a href="(.*?)">(.*?)<\/a>/g, '[$2]($1)');
    
    // Images
    md = md.replace(/<img src="(.*?)"(.*?)alt="(.*?)"(.*?)>/g, '![$3]($1)');
    md = md.replace(/<img src="(.*?)"(.*?)>/g, '![]($1)');
    
    // Lists
    md = md.replace(/<ul>([\s\S]*?)<\/ul>/g, (match, content) => {
        return '\n' + content.replace(/<li>(.*?)<\/li>/g, '- $1\n') + '\n';
    });
    md = md.replace(/<ol>([\s\S]*?)<\/ol>/g, (match, content) => {
        let counter = 1;
        return '\n' + content.replace(/<li>(.*?)<\/li>/g, () => `${counter++}. $1\n`) + '\n';
    });
    
    // Bold and italic
    md = md.replace(/<strong>(.*?)<\/strong>/g, '**$1**');
    md = md.replace(/<b>(.*?)<\/b>/g, '**$1**');
    md = md.replace(/<em>(.*?)<\/em>/g, '*$1*');
    md = md.replace(/<i>(.*?)<\/i>/g, '*$1*');
    
    // Blockquotes
    md = md.replace(/<blockquote>(.*?)<\/blockquote>/gs, (match, content) => {
        return '\n> ' + content.trim().replace(/\n/g, '\n> ') + '\n';
    });
    
    // Break tags
    md = md.replace(/<br\s*\/?>/g, '\n');
    
    // Remove remaining HTML tags
    md = md.replace(/<[^>]+>/g, '');
    
    // Decode HTML entities
    md = md.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&apos;/g, "'");
    
    // Clean up multiple newlines
    md = md.replace(/\n{3,}/g, '\n\n');
    
    return md.trim();
}

// Create slug from title
function slugify(text) {
    return text.toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '');
}

async function main() {
    console.log('📡 Fetching RSS feed from josef.codes...');
    
    try {
        const rssData = await fetchRSS();
        console.log('✅ RSS feed fetched successfully');
        console.log('RSS data length:', rssData.length);
        console.log('First 200 chars:', rssData.substring(0, 200));
        
        const parsed = await parseStringPromise(rssData, {
            explicitArray: true,
            trim: true
        });
        
        console.log('Parsed keys:', Object.keys(parsed || {}));
        
        if (!parsed || !parsed.rss) {
            console.error('❌ Invalid RSS format - no RSS element');
            console.log('Full parsed:', JSON.stringify(parsed, null, 2).substring(0, 1000));
            process.exit(1);
        }
        
        if (!parsed.rss.channel || !parsed.rss.channel[0].item) {
            console.error('❌ Invalid RSS format - no items');
            console.log('RSS keys:', Object.keys(parsed.rss));
            process.exit(1);
        }
        
        const items = parsed.rss.channel[0].item;
        
        console.log(`📝 Found ${items.length} posts`);
        
        for (const item of items) {
            const title = item.title[0].replace(/<!\[CDATA\[(.*?)\]\]>/g, '$1');
            const description = item.description[0].replace(/<!\[CDATA\[(.*?)\]\]>/g, '$1');
            const link = item.link[0];
            const pubDate = item.pubDate[0];
            const creator = item['dc:creator'] ? item['dc:creator'][0].replace(/<!\[CDATA\[(.*?)\]\]>/g, '$1') : 'Josef Ottosson';
            const categories = item.category ? item.category.map(cat => cat.replace(/<!\[CDATA\[(.*?)\]\]>/g, '$1')) : [];
            const content = item['content:encoded'] ? item['content:encoded'][0].replace(/<!\[CDATA\[(.*?)\]\]>/g, '$1') : '';
            
            // Extract slug from link
            const urlParts = link.split('/').filter(p => p);
            const slug = urlParts[urlParts.length - 1];
            
            // Convert content to markdown
            const markdownContent = htmlToMarkdown(content);
            
            // Create frontmatter
            const frontmatter = `---
layout: post.njk
title: "${title.replace(/"/g, '\\"')}"
slug: ${slug}
date: ${new Date(pubDate).toISOString().split('T')[0]}
author: ${creator}
tags:
${categories.map(cat => `  - ${cat}`).join('\n')}
excerpt: "${description.replace(/"/g, '\\"')}"
---

${markdownContent}
`;
            
            // Write to file
            const filename = `${slug}.md`;
            const filepath = path.join(POSTS_DIR, filename);
            fs.writeFileSync(filepath, frontmatter);
            console.log(`  ✅ Created ${filename}`);
        }
        
        console.log('\n✨ All posts created successfully!');
        console.log(`📁 Posts directory: ${POSTS_DIR}`);
        
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

main();
