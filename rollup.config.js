import { defineConfig } from 'rollup';
import terser from '@rollup/plugin-terser';

export default defineConfig([
  // JavaScript processing
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