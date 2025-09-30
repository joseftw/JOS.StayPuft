#!/usr/bin/env node

/**
 * Fetch Ghost Content Script
 * 
 * This script fetches content from Ghost Content API and saves it locally
 * for static site generation with Eleventy.
 * 
 * Required environment variables:
 * - GHOST_API_URL: Your Ghost site URL (e.g., https://demo.ghost.io)
 * - GHOST_CONTENT_API_KEY: Your Content API key from Ghost Admin
 */

const fs = require('fs');
const path = require('path');

// Check if we can require the Ghost Content API
let GhostContentAPI;
try {
  GhostContentAPI = require('@tryghost/content-api');
} catch (error) {
  console.error('❌ @tryghost/content-api not installed');
  console.error('   Run: npm install --save-dev @tryghost/content-api');
  process.exit(1);
}

// Configuration
const GHOST_API_URL = process.env.GHOST_API_URL || 'https://demo.ghost.io';
const GHOST_CONTENT_API_KEY = process.env.GHOST_CONTENT_API_KEY || '22444f78447824223cefc48062';
const OUTPUT_DIR = path.join(__dirname, '../_data');

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// Initialize Ghost API
const api = new GhostContentAPI({
  url: GHOST_API_URL,
  key: GHOST_CONTENT_API_KEY,
  version: 'v5.0'
});

/**
 * Fetch all posts from Ghost
 */
async function fetchPosts() {
  console.log('📝 Fetching posts...');
  try {
    const posts = await api.posts.browse({
      limit: 'all',
      include: 'tags,authors',
      formats: ['html']
    });
    console.log(`   ✅ Fetched ${posts.length} posts`);
    return posts;
  } catch (error) {
    console.error('   ❌ Error fetching posts:', error.message);
    return [];
  }
}

/**
 * Fetch all pages from Ghost
 */
async function fetchPages() {
  console.log('📄 Fetching pages...');
  try {
    const pages = await api.pages.browse({
      limit: 'all',
      include: 'authors'
    });
    console.log(`   ✅ Fetched ${pages.length} pages`);
    return pages;
  } catch (error) {
    console.error('   ❌ Error fetching pages:', error.message);
    return [];
  }
}

/**
 * Fetch all tags from Ghost
 */
async function fetchTags() {
  console.log('🏷️  Fetching tags...');
  try {
    const tags = await api.tags.browse({
      limit: 'all',
      include: 'count.posts'
    });
    console.log(`   ✅ Fetched ${tags.length} tags`);
    return tags;
  } catch (error) {
    console.error('   ❌ Error fetching tags:', error.message);
    return [];
  }
}

/**
 * Fetch all authors from Ghost
 */
async function fetchAuthors() {
  console.log('👥 Fetching authors...');
  try {
    const authors = await api.authors.browse({
      limit: 'all',
      include: 'count.posts'
    });
    console.log(`   ✅ Fetched ${authors.length} authors`);
    return authors;
  } catch (error) {
    console.error('   ❌ Error fetching authors:', error.message);
    return [];
  }
}

/**
 * Fetch site settings from Ghost
 */
async function fetchSettings() {
  console.log('⚙️  Fetching settings...');
  try {
    const settings = await api.settings.browse();
    console.log('   ✅ Fetched site settings');
    return settings;
  } catch (error) {
    console.error('   ❌ Error fetching settings:', error.message);
    return {};
  }
}

/**
 * Save data to JSON file
 */
function saveData(filename, data) {
  const filepath = path.join(OUTPUT_DIR, filename);
  fs.writeFileSync(filepath, JSON.stringify(data, null, 2));
  console.log(`   💾 Saved to ${filename}`);
}

/**
 * Main function
 */
async function main() {
  console.log('🚀 Starting Ghost content fetch...');
  console.log(`   API URL: ${GHOST_API_URL}`);
  console.log('');
  
  try {
    // Fetch all content
    const [posts, pages, tags, authors, settings] = await Promise.all([
      fetchPosts(),
      fetchPages(),
      fetchTags(),
      fetchAuthors(),
      fetchSettings()
    ]);
    
    console.log('');
    console.log('💾 Saving data...');
    
    // Save to individual files for Eleventy
    saveData('posts.json', posts);
    saveData('pages.json', pages);
    saveData('tags.json', tags);
    saveData('authors.json', authors);
    saveData('settings.json', settings);
    
    // Also save a combined file
    saveData('ghost.json', {
      posts,
      pages,
      tags,
      authors,
      settings
    });
    
    console.log('');
    console.log('✨ Content fetch completed successfully!');
    console.log('');
    console.log('📊 Summary:');
    console.log(`   Posts: ${posts.length}`);
    console.log(`   Pages: ${pages.length}`);
    console.log(`   Tags: ${tags.length}`);
    console.log(`   Authors: ${authors.length}`);
    console.log('');
    console.log('Next steps:');
    console.log('   1. Run: npm run static:build');
    console.log('   2. Or run: npm run static:serve (for development)');
    
  } catch (error) {
    console.error('❌ Fatal error:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { main };
