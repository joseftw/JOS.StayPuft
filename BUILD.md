# Build System

This theme uses a modern Node.js build system to process CSS and JavaScript files, replacing the old Gulp-based workflow.

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

# Build and create zip package for deployment
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

The build process is configured in `build.js` and uses:
- **PostCSS**: CSS processing pipeline
- **Terser**: JavaScript minification
- **Archiver**: Zip package creation
- **Chokidar**: File watching for development

## Comparison with Previous Gulp Setup

✅ **Improvements:**
- 80% fewer npm vulnerabilities (19 vs 98)
- Modern, maintained dependencies
- Better JavaScript minification with Terser
- Simpler, more maintainable build script
- Faster builds and smaller output files

📦 **Features Maintained:**
- CSS preprocessing with PostCSS
- JavaScript minification
- Source map generation
- File watching for development
- Zip packaging for theme distribution