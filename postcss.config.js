module.exports = (ctx) => ({
  map: ctx.options.map !== false ? {
    inline: false,
    annotation: true
  } : false,
  plugins: [
    require('postcss-easy-import'),
    require('postcss-custom-properties'),
    require('postcss-color-function'),
    require('autoprefixer')({
      overrideBrowserslist: ['last 2 versions']
    }),
    require('cssnano')({
      preset: ['default', {
        // More aggressive minification to match gulp output
        discardComments: { removeAll: true },
        normalizeWhitespace: true,
        reduceIdents: true,
        minifyFontValues: true,
        minifyGradients: true,
        minifyParams: true,
        minifySelectors: true,
        normalizeCharset: true,
        normalizeRepeatStyle: true,
        normalizeString: true,
        normalizeTimingFunctions: true,
        normalizeUnicode: true,
        normalizeUrl: true,
        orderedValues: true,
        reduceInitial: true,
        reduceTransforms: true,
        svgo: true,
        uniqueSelectors: true,
        // Preserve source maps
        map: { inline: false }
      }]
    })
  ]
})