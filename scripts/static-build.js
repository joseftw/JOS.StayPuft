#!/usr/bin/env node

/**
 * Static Site Build Script
 * 
 * This script orchestrates the complete static site build process:
 * 1. Fetch content from Ghost API
 * 2. Build theme assets (CSS, JS)
 * 3. Generate static HTML with Eleventy
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);
const skipFetch = args.includes('--skip-fetch');
const serve = args.includes('--serve');

console.log('🚀 Starting static site build process...\n');

/**
 * Run a command and stream output
 */
function runCommand(command, description) {
  console.log(`${description}...`);
  try {
    execSync(command, { 
      stdio: 'inherit',
      cwd: process.cwd()
    });
    console.log('✅ Done\n');
    return true;
  } catch (error) {
    console.error(`❌ Failed: ${error.message}\n`);
    return false;
  }
}

/**
 * Check if required packages are installed
 */
function checkDependencies() {
  const required = ['@11ty/eleventy', '@tryghost/content-api', 'moment'];
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  const installed = {
    ...packageJson.dependencies || {},
    ...packageJson.devDependencies || {}
  };
  
  const missing = required.filter(pkg => !installed[pkg]);
  
  if (missing.length > 0) {
    console.error('❌ Missing required dependencies:');
    missing.forEach(pkg => console.error(`   - ${pkg}`));
    console.error('\nInstall them with:');
    console.error(`   npm install --save-dev ${missing.join(' ')}`);
    process.exit(1);
  }
}

/**
 * Main build process
 */
async function main() {
  // Check dependencies
  checkDependencies();
  
  // Step 1: Fetch Ghost content (unless skipped)
  if (!skipFetch) {
    if (!runCommand('node scripts/fetch-ghost-content.js', '📥 Fetching content from Ghost API')) {
      console.error('⚠️  Content fetch failed. Continuing with cached data if available...\n');
    }
  } else {
    console.log('⏭️  Skipping content fetch (using cached data)\n');
  }
  
  // Step 2: Build theme assets (CSS, JS)
  if (!runCommand('node build.js', '🎨 Building theme assets (CSS, JS)')) {
    console.error('❌ Asset build failed. Cannot continue.');
    process.exit(1);
  }
  
  // Step 3: Generate static site with Eleventy
  const eleventyCmd = serve ? 'eleventy --serve' : 'eleventy';
  if (!runCommand(`npx ${eleventyCmd}`, serve ? '🌐 Starting Eleventy development server' : '📦 Generating static site with Eleventy')) {
    console.error('❌ Static site generation failed.');
    process.exit(1);
  }
  
  if (!serve) {
    console.log('✨ Static site build completed successfully!\n');
    console.log('📂 Output directory: _site/\n');
    console.log('Next steps:');
    console.log('   - Test locally: npx serve _site');
    console.log('   - Deploy to hosting: copy _site/ to your web server');
    console.log('   - Or use: npm run static:serve (for development preview)');
  }
}

// Run
main().catch(error => {
  console.error('❌ Build failed:', error);
  process.exit(1);
});
