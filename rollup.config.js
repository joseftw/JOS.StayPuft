import { defineConfig } from 'rollup';
import terser from '@rollup/plugin-terser';

export default defineConfig([
  // Combined JavaScript bundle for better performance  
  {
    input: 'assets/js/theme-bundle.js',
    output: {
      file: 'assets/built/theme.js',
      format: 'iife',
      sourcemap: true
    },
    plugins: [
      terser({
        compress: {
          drop_console: false,
          drop_debugger: true,
          pure_funcs: ['Math.floor', 'Math.round']
        },
        mangle: {
          keep_fnames: false
        }
      })
    ]
  },
  // Individual files for selective loading (keeping originals for backward compatibility)
  {
    input: 'assets/js/infinitescroll.js',
    output: {
      file: 'assets/built/infinitescroll.js',
      format: 'iife',
      sourcemap: true
    },
    plugins: [
      terser({
        compress: {
          drop_console: false,
          drop_debugger: true,
          pure_funcs: ['Math.floor', 'Math.round']
        },
        mangle: {
          keep_fnames: false
        }
      })
    ]
  },
  {
    input: 'assets/js/prism/prism.js',
    output: {
      file: 'assets/built/prism.js',
      format: 'iife',
      sourcemap: true
    },
    plugins: [
      terser({
        compress: {
          drop_console: false,
          drop_debugger: true,
          pure_funcs: ['Math.floor', 'Math.round']
        },
        mangle: {
          keep_fnames: false
        }
      })
    ]
  }
]);