const Handlebars = require('handlebars');
const moment = require('moment');

module.exports = function(eleventyConfig) {
  // Copy static assets
  eleventyConfig.addPassthroughCopy("assets/built");
  eleventyConfig.addPassthroughCopy("assets/css/fonts");
  
  // Set up Handlebars engine
  const handlebarsEngine = eleventyConfig.getFilter("handlebars");
  
  // Register Handlebars helpers to match Ghost helpers
  Handlebars.registerHelper('foreach', function(context, options) {
    let ret = '';
    if (context && context.length > 0) {
      for (let i = 0; i < context.length; i++) {
        ret += options.fn(context[i], {
          data: {
            index: i,
            first: i === 0,
            last: i === context.length - 1
          }
        });
      }
    }
    return ret;
  });
  
  Handlebars.registerHelper('has', function(options) {
    // Simplified has helper for basic checks
    return options.fn(this);
  });
  
  Handlebars.registerHelper('plural', function(count, options) {
    const hash = options.hash;
    if (count === 0) return hash.empty || '';
    if (count === 1) return (hash.singular || '% item').replace('%', count);
    return (hash.plural || '% items').replace('%', count);
  });
  
  Handlebars.registerHelper('date', function(date, options) {
    const format = options.hash.format || 'MMMM Do, YYYY';
    const timeago = options.hash.timeago;
    
    if (timeago) {
      return moment(date).fromNow();
    }
    return moment(date).format(format);
  });
  
  Handlebars.registerHelper('img_url', function(image, options) {
    const size = options.hash.size || 'medium';
    // In static build, return image as-is
    // In production, you might want to add image optimization
    return image;
  });
  
  Handlebars.registerHelper('url', function() {
    // Return the URL for the current context
    return this.url || this.slug || '/';
  });
  
  Handlebars.registerHelper('get', function(resource, options) {
    // This is a complex helper that would need proper implementation
    // For POC, return empty to avoid errors
    return '';
  });
  
  // Add collections for different content types
  eleventyConfig.addCollection("posts", function(collectionApi) {
    // Posts will be loaded from Ghost data
    return [];
  });
  
  eleventyConfig.addCollection("tags", function(collectionApi) {
    // Tags will be loaded from Ghost data
    return [];
  });
  
  // Custom filters
  eleventyConfig.addFilter("dateFormat", function(date, format) {
    return moment(date).format(format || 'MMMM Do, YYYY');
  });
  
  eleventyConfig.addFilter("timeago", function(date) {
    return moment(date).fromNow();
  });
  
  eleventyConfig.addFilter("limit", function(array, limit) {
    return array.slice(0, limit);
  });
  
  return {
    dir: {
      input: ".",
      output: "_site",
      includes: "partials",
      layouts: "_layouts"
    },
    templateFormats: ["hbs", "html", "md"],
    htmlTemplateEngine: "hbs",
    markdownTemplateEngine: "hbs"
  };
};
