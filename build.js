#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const postcss = require('postcss');
const zlib = require('zlib');
const { spawn } = require('child_process');

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
 * Process CSS files using PostCSS
 * Process main CSS files and create a combined bundle
 */
async function processCSS() {
    console.log('🎨 Processing CSS files...');
    
    try {
        // Process the main CSS file - staypuft.css imports all others
        const mainCssFile = 'staypuft.css';
        const inputPath = path.join(CSS_DIR, mainCssFile);
        const outputPath = path.join(BUILT_DIR, mainCssFile);
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
        
        console.log(`  ✅ ${mainCssFile} -> built/${mainCssFile} (includes all imports)`);
        
        // Process the combined theme bundle (includes everything)
        const bundleCssFile = 'theme-bundle.css';
        const bundleInputPath = path.join(CSS_DIR, bundleCssFile);
        const bundleOutputPath = path.join(BUILT_DIR, 'theme.css');
        const bundleMapPath = bundleOutputPath + '.map';
        
        if (fs.existsSync(bundleInputPath)) {
            const bundleCss = fs.readFileSync(bundleInputPath, 'utf8');
            
            const bundleResult = await processor.process(bundleCss, {
                from: bundleInputPath,
                to: bundleOutputPath,
                map: { inline: false, annotation: false }
            });
            
            // Write CSS bundle file
            fs.writeFileSync(bundleOutputPath, bundleResult.css);
            
            // Write source map
            if (bundleResult.map) {
                fs.writeFileSync(bundleMapPath, bundleResult.map.toString());
            }
            
            console.log(`  ✅ ${bundleCssFile} -> built/theme.css (complete combined bundle)`);
        }
        
        // Also process standalone files that aren't imported by the main file
        const standaloneFiles = ['prism.css']; // Keep prism separate for backward compatibility
        
        for (const file of standaloneFiles) {
            const inputPath = path.join(CSS_DIR, file);
            const outputPath = path.join(BUILT_DIR, file);
            const mapPath = outputPath + '.map';
            
            if (fs.existsSync(inputPath)) {
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
        }
    } catch (error) {
        console.error('❌ CSS processing error:', error.message);
        if (!isWatch) process.exit(1);
    }
}

/**
 * Process JavaScript files using Rollup
 */
async function processJS() {
    console.log('⚡ Processing JavaScript files with Rollup...');
    
    return new Promise((resolve, reject) => {
        const rollup = spawn('npx', ['rollup', '-c'], {
            stdio: 'pipe',
            cwd: process.cwd()
        });
        
        let output = '';
        let errorOutput = '';
        
        rollup.stdout.on('data', (data) => {
            output += data.toString();
        });
        
        rollup.stderr.on('data', (data) => {
            errorOutput += data.toString();
        });
        
        rollup.on('close', (code) => {
            if (code === 0) {
                console.log('  ✅ JavaScript files processed with Rollup');
                resolve();
            } else {
                console.error('❌ Rollup error:', errorOutput);
                if (!isWatch) {
                    reject(new Error(`Rollup failed with code ${code}`));
                } else {
                    resolve(); // In watch mode, don't fail completely
                }
            }
        });
    });
}

/**
 * Create zip package using native Node.js
 */
async function createZip() {
    console.log('📦 Creating zip package...');
    
    if (!fs.existsSync(DIST_DIR)) {
        fs.mkdirSync(DIST_DIR, { recursive: true });
    }
    
    const packageJson = JSON.parse(fs.readFileSync('./package.json', 'utf8'));
    const zipName = `${packageJson.name}.zip`;
    const zipPath = path.join(DIST_DIR, zipName);
    
    const tarPath = path.join(DIST_DIR, `${packageJson.name}.tar.gz`);
    
    try {
        const { execSync } = require('child_process');
        
        // Use native tar command
        const excludePatterns = [
            '--exclude=node_modules',
            '--exclude=dist',
            '--exclude=.git',
            '--exclude=*.log',
            '--exclude=.DS_Store',
            '--exclude=Thumbs.db'
        ].join(' ');
        
        execSync(`tar ${excludePatterns} -czf "${tarPath}" .`, { 
            cwd: process.cwd(),
            stdio: 'pipe'
        });
        
        const stats = fs.statSync(tarPath);
        console.log(`  ✅ Created ${packageJson.name}.tar.gz (${stats.size} bytes)`);
        
        // Also try to create zip if command available
        try {
            execSync(`zip -r "${zipPath}" . -x 'node_modules/*' 'dist/*' '.git/*' '*.log' '.DS_Store' 'Thumbs.db'`, {
                cwd: process.cwd(),
                stdio: 'pipe'
            });
            
            const zipStats = fs.statSync(zipPath);
            console.log(`  ✅ Created ${packageJson.name}.zip (${zipStats.size} bytes)`);
        } catch (zipError) {
            console.log('  ℹ️  System zip not available, tar.gz created instead');
        }
        
    } catch (error) {
        console.error('❌ Archive creation failed:', error.message);
        throw error;
    }
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

/**
 * Main build function
 */
async function build() {
    console.log('🚀 Starting build process with Rollup...');
    
    await processCSS();
    await processJS();
    
    if (isZip) {
        await createZip();
    }
    
    console.log('✨ Build completed successfully!');
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