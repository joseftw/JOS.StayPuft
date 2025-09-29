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

### CSS Optimization (Fully Combined)
The build system now creates a **single combined CSS bundle** for maximum performance:

**Default: Combined CSS bundle** `theme.css` (63KB)
- Combines all theme styles: global, fonts, koenig, screen, staypuft
- Includes syntax highlighting (prism) 
- Single HTTP request instead of 2-3 separate CSS files
- Optimized for HTTP/2 and HTTP/3 protocols

**Alternative: Individual files** (available if needed)
- `staypuft.css` (62KB) - Main theme styles bundle
- `prism.css` (1KB) - Syntax highlighting only

**Size improvements**: 52.5% reduction from original (133KB → 63KB) by eliminating duplicate imports.

### JavaScript Bundling (Default)
The build system uses a **combined JavaScript bundle** for optimal HTTP/2 and HTTP/3 performance:

**Default: Combined bundle** `theme.js` (14KB)
- Combines infinite scroll functionality and syntax highlighting
- Reduces HTTP requests and protocol overhead
- Better compression and caching efficiency
- Optimized for modern HTTP protocols

**Alternative: Individual files** (available if needed)
- `infinitescroll.js` (1KB) - Infinite scroll functionality
- `prism.js` (13KB) - Syntax highlighting

The default template setup now uses **single combined bundles for both CSS and JavaScript**. For individual file loading, you can replace:
```handlebars
<link rel="stylesheet" href="{{asset "built/theme.css"}}">
<script defer async src="{{asset "built/theme.js"}}"></script>
```
with individual loading:
```handlebars
<link rel="stylesheet" href="{{asset "built/staypuft.css"}}">
<link rel="stylesheet" href="{{asset "built/prism.css"}}">
<script defer async src="{{asset "built/infinitescroll.js"}}"></script>
<script defer async src="{{asset "built/prism.js"}}"></script>
```