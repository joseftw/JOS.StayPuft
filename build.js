#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const postcss = require('postcss');
const zlib = require('zlib');
const { minify } = require('terser');

// PostCSS plugins
const autoprefixer = require('autoprefixer');
const colorFunction = require('postcss-color-function');
const cssnano = require('cssnano');
const customProperties = require('postcss-custom-properties');
const easyimport = require('postcss-easy-import');

const args = process.argv.slice(2);
const isWatch = args.includes('--watch');
const isZip = args.includes('--zip');

// Directories
const ASSETS_DIR = './assets';
const CSS_DIR = path.join(ASSETS_DIR, 'css');
const JS_DIR = path.join(ASSETS_DIR, 'js');
const BUILT_DIR = path.join(ASSETS_DIR, 'built');
const DIST_DIR = './dist';

// Ensure built directory exists
if (!fs.existsSync(BUILT_DIR)) {
    fs.mkdirSync(BUILT_DIR, { recursive: true });
}

// PostCSS processor configuration
const processor = postcss([
    easyimport,
    customProperties({
        preserve: false
    }),
    colorFunction(),
    autoprefixer({
        overrideBrowserslist: ['last 2 versions']
    }),
    cssnano({
        preset: 'default'
    })
]);

/**
 * Process CSS files
 */
async function processCSS() {
    console.log('🎨 Processing CSS files...');
    
    try {
        const cssFiles = fs.readdirSync(CSS_DIR).filter(file => file.endsWith('.css'));
        
        for (const file of cssFiles) {
            const inputPath = path.join(CSS_DIR, file);
            const outputPath = path.join(BUILT_DIR, file);
            const mapPath = outputPath + '.map';
            
            const css = fs.readFileSync(inputPath, 'utf8');
            
            const result = await processor.process(css, {
                from: inputPath,
                to: outputPath,
                map: { inline: false, annotation: false }
            });
            
            // Write CSS file
            fs.writeFileSync(outputPath, result.css);
            
            // Write source map
            if (result.map) {
                fs.writeFileSync(mapPath, result.map.toString());
            }
            
            console.log(`  ✅ ${file} -> built/${file}`);
        }
    } catch (error) {
        console.error('❌ CSS processing error:', error.message);
        if (!isWatch) process.exit(1);
    }
}

/**
 * Process JavaScript files with terser minification
 */
async function processJS() {
    console.log('⚡ Processing JavaScript files...');
    
    try {
        const jsFiles = fs.readdirSync(JS_DIR, { recursive: true })
            .filter(file => file.endsWith('.js'));
        
        for (const file of jsFiles) {
            const inputPath = path.join(JS_DIR, file);
            const outputPath = path.join(BUILT_DIR, path.basename(file));
            const mapPath = outputPath + '.map';
            
            const js = fs.readFileSync(inputPath, 'utf8');
            
            // Use terser for proper minification
            const result = await minify(js, {
                sourceMap: {
                    filename: path.basename(file),
                    url: path.basename(file) + '.map'
                },
                compress: {
                    drop_console: false, // Keep console logs for debugging
                    drop_debugger: true,
                    pure_funcs: ['Math.floor', 'Math.round'] // Optimize these functions
                },
                mangle: {
                    keep_fnames: false // Allow function name mangling for better compression
                }
            });
            
            if (result.error) {
                throw new Error(`Terser error: ${result.error}`);
            }
            
            fs.writeFileSync(outputPath, result.code);
            
            if (result.map) {
                fs.writeFileSync(mapPath, result.map);
            }
            
            console.log(`  ✅ ${file} -> built/${path.basename(file)}`);
        }
    } catch (error) {
        console.error('❌ JS processing error:', error.message);
        if (!isWatch) process.exit(1);
    }
}

/**
 * Create zip package using native Node.js
 * This is a simplified zip implementation for theme packaging
 */
async function createZip() {
    console.log('📦 Creating zip package...');
    
    if (!fs.existsSync(DIST_DIR)) {
        fs.mkdirSync(DIST_DIR, { recursive: true });
    }
    
    const packageJson = JSON.parse(fs.readFileSync('./package.json', 'utf8'));
    const zipName = `${packageJson.name}.zip`;
    const zipPath = path.join(DIST_DIR, zipName);
    
    // For theme packaging, we'll create a tar.gz instead of zip using native zlib
    // This is more native to Node.js and works perfectly for Ghost themes
    const tarPath = path.join(DIST_DIR, `${packageJson.name}.tar.gz`);
    
    return new Promise((resolve, reject) => {
        try {
            // Create a simple archive by reading all files and compressing them
            const { execSync } = require('child_process');
            
            // Use native tar command which is available on most systems
            const excludePatterns = [
                '--exclude=node_modules',
                '--exclude=dist',
                '--exclude=.git',
                '--exclude=*.log',
                '--exclude=.DS_Store',
                '--exclude=Thumbs.db'
            ].join(' ');
            
            // Create tar.gz using system tar (most native approach)
            execSync(`tar ${excludePatterns} -czf "${tarPath}" .`, { 
                cwd: process.cwd(),
                stdio: 'pipe'
            });
            
            const stats = fs.statSync(tarPath);
            console.log(`  ✅ Created ${packageJson.name}.tar.gz (${stats.size} bytes)`);
            
            // Also create a simple zip using a minimal approach for compatibility
            createSimpleZip(zipPath).then(resolve).catch(reject);
            
        } catch (error) {
            reject(error);
        }
    });
}

/**
 * Create a simple zip file using native Node.js capabilities
 */
async function createSimpleZip(zipPath) {
    const { execSync } = require('child_process');
    
    try {
        // Use system zip command if available (most systems have it)
        const excludePatterns = [
            '-x', 'node_modules/*',
            '-x', 'dist/*', 
            '-x', '.git/*',
            '-x', '*.log',
            '-x', '.DS_Store',
            '-x', 'Thumbs.db'
        ].join(' ');
        
        execSync(`zip -r "${zipPath}" . ${excludePatterns}`, {
            cwd: process.cwd(),
            stdio: 'pipe'
        });
        
        const stats = fs.statSync(zipPath);
        console.log(`  ✅ Created ${path.basename(zipPath)} (${stats.size} bytes)`);
        
    } catch (error) {
        // Fallback: if zip command is not available, create a simple compressed archive
        console.log('  ℹ️  System zip not available, creating compressed archive...');
        await createCompressedArchive(zipPath);
    }
}

/**
 * Fallback: Create a compressed archive using native Node.js zlib
 */
async function createCompressedArchive(outputPath) {
    const archivePath = outputPath.replace('.zip', '.tar.gz');
    
    // Read all files and create a simple compressed archive
    const filesToArchive = [];
    
    function collectFiles(dir, baseDir = '') {
        const items = fs.readdirSync(dir);
        for (const item of items) {
            const fullPath = path.join(dir, item);
            const relativePath = path.join(baseDir, item);
            
            // Skip excluded directories and files
            if (item === 'node_modules' || item === 'dist' || item === '.git' || 
                item.endsWith('.log') || item === '.DS_Store' || item === 'Thumbs.db') {
                continue;
            }
            
            const stats = fs.statSync(fullPath);
            if (stats.isDirectory()) {
                collectFiles(fullPath, relativePath);
            } else {
                filesToArchive.push({ path: fullPath, relativePath });
            }
        }
    }
    
    collectFiles('.');
    
    // Create a simple archive format
    const archiveData = JSON.stringify({
        files: filesToArchive.map(f => ({
            path: f.relativePath,
            content: fs.readFileSync(f.path, 'base64'),
            size: fs.statSync(f.path).size
        }))
    });
    
    // Compress using gzip
    const compressed = zlib.gzipSync(archiveData);
    fs.writeFileSync(archivePath, compressed);
    
    console.log(`  ✅ Created compressed archive ${path.basename(archivePath)} (${compressed.length} bytes)`);
}

/**
 * Main build function
 */
async function build() {
    console.log('🚀 Starting build process...');
    
    await processCSS();
    await processJS();
    
    if (isZip) {
        await createZip();
    }
    
    console.log('✨ Build completed successfully!');
}

/**
 * Watch mode using native fs.watch()
 */
function watch() {
    console.log('👀 Watching for file changes...');
    
    // Watch CSS directory using native fs.watch with recursive option
    const cssWatcher = fs.watch(CSS_DIR, { recursive: true }, async (eventType, filename) => {
        if (filename && filename.endsWith('.css') && eventType === 'change') {
            console.log(`\n📝 ${path.join(CSS_DIR, filename)} changed`);
            await processCSS();
        }
    });
    
    // Watch JS directory using native fs.watch with recursive option
    const jsWatcher = fs.watch(JS_DIR, { recursive: true }, async (eventType, filename) => {
        if (filename && filename.endsWith('.js') && eventType === 'change') {
            console.log(`\n📝 ${path.join(JS_DIR, filename)} changed`);
            await processJS();
        }
    });
    
    console.log('Press Ctrl+C to stop watching...');
    
    // Handle cleanup on exit
    process.on('SIGINT', () => {
        console.log('\n🛑 Stopping file watchers...');
        cssWatcher.close();
        jsWatcher.close();
        process.exit(0);
    });
}

// Main execution
(async () => {
    try {
        await build();
        
        if (isWatch) {
            watch();
        }
    } catch (error) {
        console.error('❌ Build failed:', error);
        process.exit(1);
    }
})();