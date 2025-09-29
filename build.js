#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const postcss = require('postcss');
const archiver = require('archiver');
const chokidar = require('chokidar');
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
 * Create zip package
 */
async function createZip() {
    console.log('📦 Creating zip package...');
    
    if (!fs.existsSync(DIST_DIR)) {
        fs.mkdirSync(DIST_DIR, { recursive: true });
    }
    
    const packageJson = JSON.parse(fs.readFileSync('./package.json', 'utf8'));
    const zipName = `${packageJson.name}.zip`;
    const zipPath = path.join(DIST_DIR, zipName);
    
    return new Promise((resolve, reject) => {
        const output = fs.createWriteStream(zipPath);
        const archive = archiver('zip', { zlib: { level: 9 } });
        
        output.on('close', () => {
            console.log(`  ✅ Created ${zipName} (${archive.pointer()} bytes)`);
            resolve();
        });
        
        archive.on('error', reject);
        archive.pipe(output);
        
        // Add all files except node_modules and dist
        archive.glob('**/*', {
            ignore: [
                'node_modules/**',
                'dist/**',
                '.git/**',
                '*.log',
                '.DS_Store',
                'Thumbs.db'
            ]
        });
        
        archive.finalize();
    });
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
 * Watch mode
 */
function watch() {
    console.log('👀 Watching for file changes...');
    
    const cssWatcher = chokidar.watch(path.join(CSS_DIR, '**/*.css'));
    const jsWatcher = chokidar.watch(path.join(JS_DIR, '**/*.js'));
    
    cssWatcher.on('change', async (filePath) => {
        console.log(`\n📝 ${path.relative('.', filePath)} changed`);
        await processCSS();
    });
    
    jsWatcher.on('change', async (filePath) => {
        console.log(`\n📝 ${path.relative('.', filePath)} changed`);
        await processJS();
    });
    
    console.log('Press Ctrl+C to stop watching...');
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