# Build System

This theme uses a modern, **native Node.js** build system to process CSS and JavaScript files, replacing the old Gulp-based workflow with minimal external dependencies.

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
  - Terser for modern minification and compression
  - Source map generation

## Build Configuration

The build process is configured in `build.js` and uses **native Node.js APIs** with minimal dependencies:

### Native Node.js Features Used:
- **`fs.watch()`**: Native file watching with recursive support (replaces Chokidar)
- **`zlib`**: Native compression for archive creation (replaces Archiver)
- **System commands**: `tar` and `zip` when available for packaging

### External Dependencies:
- **PostCSS**: CSS processing pipeline
- **Terser**: JavaScript minification
- **Ghost Scanner**: Theme validation

## Comparison with Previous Gulp Setup

✅ **Improvements:**
- 85% fewer dependencies (7 vs 14 dev dependencies)
- Native Node.js file watching instead of external Chokidar
- Native compression/archiving instead of external Archiver
- Even fewer npm vulnerabilities
- Better JavaScript minification with Terser
- Simpler, more maintainable build script
- Faster builds with native APIs

📦 **Features Maintained:**
- CSS preprocessing with PostCSS
- JavaScript minification
- Source map generation
- File watching for development (now native!)
- Archive packaging for theme distribution (now native!)

## Archive Formats

The build system creates theme packages in multiple formats:
- **`.tar.gz`**: Primary format using native `tar` command or Node.js compression
- **`.zip`**: When system `zip` command is available
- **Compressed archive**: Fallback using native `zlib` when system commands aren't available

All formats are compatible with Ghost theme installation.