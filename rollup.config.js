import { defineConfig } from 'rollup';
import terser from '@rollup/plugin-terser';
import postcss from 'rollup-plugin-postcss';

// PostCSS plugins
import autoprefixer from 'autoprefixer';
import colorFunction from 'postcss-color-function';
import cssnano from 'cssnano';
import customProperties from 'postcss-custom-properties';
import easyimport from 'postcss-easy-import';

// Configuration for different asset types
const postcssConfig = {
  extract: false, // We'll handle extraction manually
  minimize: true,
  sourceMap: true,
  plugins: [
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
  ]
};

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