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

## Performance Optimizations

### CSS Optimization
The build system now properly combines CSS files for optimal performance:
- **Main CSS bundle**: `staypuft.css` (combines global.css, fonts.css, koenig.css, screen.css)
- **Standalone CSS**: `prism.css` (syntax highlighting, loaded separately)

**Size improvements**: 52.5% reduction (133KB → 63KB) by eliminating duplicate imports.

### JavaScript Bundling Options
The build system provides both approaches:

**Option 1: Individual files** (current template setup)
- `infinitescroll.js` (1KB) - Infinite scroll functionality
- `prism.js` (13KB) - Syntax highlighting

**Option 2: Combined bundle** (better performance)
- `theme.js` (14KB) - Combines both scripts into one file

To use the combined bundle, update your templates to replace:
```handlebars
<script defer async src="{{asset "built/infinitescroll.js"}}"></script>
```
with:
```handlebars
<script defer async src="{{asset "built/theme.js"}}"></script>
```