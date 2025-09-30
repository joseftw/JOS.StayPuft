const Handlebars = require('handlebars');
const moment = require('moment');

module.exports = function(eleventyConfig) {
  // Add Handlebars plugin support for Eleventy v3.0+
  // In v3.0, template languages moved to separate plugins
  try {
    const handlebarsPlugin = require('@11ty/eleventy-plugin-handlebars');
    eleventyConfig.addPlugin(handlebarsPlugin);
  } catch (error) {
    // Plugin not installed - provide helpful error message
    console.warn('⚠️  @11ty/eleventy-plugin-handlebars not found.');
    console.warn('   Install it with: npm install --save-dev @11ty/eleventy-plugin-handlebars');
  }
  
  // Copy static assets
  eleventyConfig.addPassthroughCopy("assets/built");
  eleventyConfig.addPassthroughCopy("assets/css/fonts");
  
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
    const hash = (options && options.hash) || {};
    if (count === 0) return hash.empty || '';
    if (count === 1) return (hash.singular || '% item').replace('%', count);
    return (hash.plural || '% items').replace('%', count);
  });
  
  Handlebars.registerHelper('date', function(date, options) {
    if (!options || !options.hash) {
      // If called without options, just format with default
      return moment(date).format('MMMM Do, YYYY');
    }
    const format = options.hash.format || 'MMMM Do, YYYY';
    const timeago = options.hash.timeago;
    
    if (timeago) {
      return moment(date).fromNow();
    }
    return moment(date).format(format);
  });
  
  Handlebars.registerHelper('img_url', function(image, options) {
    const size = (options && options.hash && options.hash.size) || 'medium';
    // In static build, return image as-is
    // In production, you might want to add image optimization
    return image || '';
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
  
  // Ghost {{asset}} helper - returns path to theme assets
  Handlebars.registerHelper('asset', function(path, options) {
    // Remove leading slash if present
    const cleanPath = path.replace(/^\//, '');
    // Return relative path to asset
    return `/${cleanPath}`;
  });
  
  // Ghost {{#is}} helper - conditional helper for template context
  Handlebars.registerHelper('is', function(context, options) {
    // Check if we're in a specific template context
    // This is a simplified version - Ghost's is more complex
    const contexts = context.split(',').map(c => c.trim());
    
    // Get the current page context from data
    // In static site, we determine context from the template being rendered
    let currentContext = this.context || 'index';
    
    if (contexts.includes(currentContext)) {
      return options.fn(this);
    }
    return options.inverse(this);
  });
  
  // Ghost {{#match}} helper - conditional matching
  Handlebars.registerHelper('match', function(value, comparison, options) {
    // Simplified match helper
    if (!options) {
      return '';
    }
    // For now, just check equality
    if (value === comparison) {
      return options.fn(this);
    }
    return options.inverse(this);
  });
  
  // Ghost {{block}} and {{#contentFor}} helpers for content blocks
  const contentBlocks = {};
  
  Handlebars.registerHelper('contentFor', function(name, options) {
    // Store content for later use with {{block}}
    if (options && options.fn) {
      contentBlocks[name] = options.fn(this);
    }
    return '';
  });
  
  Handlebars.registerHelper('block', function(name) {
    // Retrieve content stored with {{#contentFor}}
    return new Handlebars.SafeString(contentBlocks[name] || '');
  });
  
  // Ghost {{body_class}} helper - CSS classes for body tag
  Handlebars.registerHelper('body_class', function() {
    const classes = [];
    // Add template-specific class
    if (this.context) {
      classes.push(`${this.context}-template`);
    }
    return classes.join(' ');
  });
  
  // Ghost {{post_class}} helper - CSS classes for post
  Handlebars.registerHelper('post_class', function() {
    const classes = ['post'];
    if (this.featured) {
      classes.push('featured');
    }
    if (this.page) {
      classes.push('page');
    }
    return classes.join(' ');
  });
  
  // Ghost {{ghost_head}} helper - outputs meta tags and scripts
  Handlebars.registerHelper('ghost_head', function() {
    // In static site, this would be minimal or handled by Eleventy
    return new Handlebars.SafeString('');
  });
  
  // Ghost {{ghost_foot}} helper - outputs scripts before </body>
  Handlebars.registerHelper('ghost_foot', function() {
    // In static site, this would be minimal or handled by Eleventy
    return new Handlebars.SafeString('');
  });
  
  // Ghost {{navigation}} helper - outputs navigation menu
  Handlebars.registerHelper('navigation', function() {
    // This would need site settings from _data
    return new Handlebars.SafeString('');
  });
  
  // Ghost {{meta_title}} helper - outputs page title
  Handlebars.registerHelper('meta_title', function() {
    return this.title || this.name || 'Untitled';
  });
  
  // Ghost {{encode}} helper - URL encode a string
  Handlebars.registerHelper('encode', function(str) {
    return encodeURIComponent(str || '');
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
  
  // Ignore markdown files in root and docs - they're documentation, not content
  eleventyConfig.ignores.add("*.md");
  eleventyConfig.ignores.add("docs/**/*.md");
  eleventyConfig.ignores.add("README.md");
  eleventyConfig.ignores.add("BUILD.md");
  eleventyConfig.ignores.add("STATIC_*.md");
  eleventyConfig.ignores.add("IMPLEMENTATION_*.md");
  
  return {
    dir: {
      input: ".",
      output: "_site",
      includes: "partials",
      layouts: "_layouts"
    },
    templateFormats: ["hbs", "html"],
    htmlTemplateEngine: "hbs"
  };
};
