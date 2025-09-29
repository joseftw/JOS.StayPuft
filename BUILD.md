# Build System

This theme uses **Rollup** for JavaScript processing and PostCSS for CSS processing, replacing the old Gulp-based workflow with industry-standard modern tools.

## Requirements

- Node.js 18+ and npm

## Development

```bash
# Install dependencies
npm install

# Build assets once
npm run build

# Build and watch for changes (development mode)
npm run dev

# Build and create archive package for deployment
npm run zip

# Test theme with Ghost scanner
npm test
```

## What gets processed

### CSS Files
- **Input**: `assets/css/*.css`
- **Output**: `assets/built/*.css` + source maps
- **Processing**: 
  - PostCSS with easy import for file concatenation
  - Custom properties and color functions
  - Autoprefixer for browser compatibility
  - CSS Nano for minification

### JavaScript Files
- **Input**: `assets/js/**/*.js`
- **Output**: `assets/built/*.js` + source maps
- **Processing**:
  - **Rollup**: Industry-standard bundler and minifier
  - Terser plugin for optimal compression
  - Source map generation

## Build Configuration

The build process uses **industry-standard tools**:

- **`rollup.config.js`**: Rollup configuration for JavaScript processing
- **PostCSS**: CSS processing pipeline (same as before)
- **Native `fs.watch()`**: Built-in file watching with recursive support
- **Native compression**: Using `zlib`, system `tar`/`zip` commands

## Comparison with Previous Setup

✅ **Improvements Over Custom Build:**
- **Industry Standard**: Rollup is used by Vue, Svelte, and many major projects
- **Better Optimization**: Superior JavaScript minification and tree-shaking
- **Proven Reliability**: Battle-tested by the JavaScript community
- **Future-Proof**: Active development and long-term support
- **Ecosystem**: Rich plugin ecosystem if needed

✅ **Maintained from Native Approach:**
- **Minimal Dependencies**: Only 9 dev dependencies
- **Native File Watching**: Still using `fs.watch()` instead of external packages
- **Native Archive Creation**: Still using native Node.js compression
- **Fast Builds**: Native APIs combined with optimized Rollup

📦 **Features Maintained:**
- CSS preprocessing with PostCSS
- JavaScript minification (now with Rollup + Terser)
- Source map generation
- File watching for development (native!)
- Archive packaging for theme distribution (native!)

## Archive Formats

The build system creates theme packages in multiple formats:
- **`.tar.gz`**: Primary format using native `tar` command
- **`.zip`**: When system `zip` command is available
- All formats are compatible with Ghost theme installation

## Why Rollup?

Rollup was chosen over custom solutions because:
- **Designed for libraries/themes**: Perfect for this use case
- **Better than Webpack**: Simpler configuration, smaller bundles
- **Industry standard**: Used by major projects, well-maintained
- **Excellent minification**: Superior compression compared to custom terser usage
- **Reliable**: Mature, stable, and actively developed