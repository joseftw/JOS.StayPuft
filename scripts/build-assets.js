#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🚀 Building theme assets...');

// Create built directory
const builtDir = path.join(__dirname, '../assets/built');
if (!fs.existsSync(builtDir)) {
    fs.mkdirSync(builtDir, { recursive: true });
}

// Combine CSS files
const cssFiles = [
    path.join(__dirname, '../assets/css/screen.css'),
    path.join(__dirname, '../assets/css/staypuft.css'),
    path.join(__dirname, '../assets/css/prism.css')
];

let combinedCSS = '';
cssFiles.forEach(file => {
    if (fs.existsSync(file)) {
        combinedCSS += fs.readFileSync(file, 'utf8') + '\n';
    }
});

fs.writeFileSync(path.join(builtDir, 'theme.css'), combinedCSS);
console.log('  ✅ theme.css created');

// Combine JS files
const jsFiles = [
    path.join(__dirname, '../assets/js/infinitescroll.js'),
    path.join(__dirname, '../assets/js/prism/prism.js')
];

let combinedJS = '';
jsFiles.forEach(file => {
    if (fs.existsSync(file)) {
        combinedJS += fs.readFileSync(file, 'utf8') + '\n';
    }
});

fs.writeFileSync(path.join(builtDir, 'theme.js'), combinedJS);
console.log('  ✅ theme.js created');

console.log('✨ Asset build completed successfully!');
