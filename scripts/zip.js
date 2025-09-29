#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Get theme name from package.json
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const themeName = packageJson.name;
const targetDir = 'dist';
const filename = `${themeName}.zip`;

// Create dist directory if it doesn't exist
if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

console.log(`Creating theme package: ${targetDir}/${filename}`);

// Create zip file excluding node_modules, dist, and development files
try {
  execSync(`zip -r "${targetDir}/${filename}" . \\
    -x "node_modules/*" \\
    -x "dist/*" \\
    -x ".git/*" \\
    -x "*.zip" \\
    -x "scripts/*" \\
    -x "postcss.config.js" \\
    -x "gulpfile.js"`, { stdio: 'inherit' });
  
  console.log(`Package created successfully: ${targetDir}/${filename}`);
} catch (error) {
  console.error('Error creating package:', error.message);
  process.exit(1);
}